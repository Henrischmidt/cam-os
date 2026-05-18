// Writes the66-state.json to a user-selected directory (iCloud Drive / Scriptable folder).
// Uses the File System Access API — Chromium only; gracefully no-ops elsewhere.
// The directory handle is persisted in IndexedDB so the user only picks once.
//
// iOS path: uses Web Share API (navigator.share with File) — user saves to
// Files › iCloud Drive › Scriptable manually. Detected via iosExportAvailable().

const IDB_NAME = 'cam-os-icloud-sync'
const IDB_STORE = 'handles'
const HANDLE_KEY = 'the66-folder'
const FILE_NAME = 'the66-state.json'

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function putHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(handle, HANDLE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function getHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB()
    return await new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const req = tx.objectStore(IDB_STORE).get(HANDLE_KEY)
      req.onsuccess = () => resolve((req.result as FileSystemDirectoryHandle) ?? null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

async function clearHandle(): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite')
      tx.objectStore(IDB_STORE).delete(HANDLE_KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    })
  } catch {
    // ignore
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function iCloudSyncAvailable(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

/** Ask user to pick their iCloud Drive / Scriptable folder. Returns true on success. */
export async function connectICloudFolder(): Promise<boolean> {
  if (!iCloudSyncAvailable()) return false
  try {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
    await putHandle(handle)
    return true
  } catch {
    return false
  }
}

/** Returns true if a folder handle is stored and still has permission. */
export async function iCloudSyncConfigured(): Promise<boolean> {
  const handle = await getHandle()
  if (!handle) return false
  try {
    const perm = await handle.queryPermission({ mode: 'readwrite' })
    return perm === 'granted'
  } catch {
    return false
  }
}

/** Disconnect — removes stored handle. */
export async function disconnectICloudFolder(): Promise<void> {
  await clearHandle()
}

// ─── iOS Share API path ───────────────────────────────────────────────────────

/**
 * Returns true if the Web Share API can share files on this device (iOS 15+).
 * Used to show the iOS manual-export path in Settings when File System Access
 * is unavailable.
 */
export function iosExportAvailable(): boolean {
  if (typeof window === 'undefined' || !('share' in navigator)) return false
  try {
    return navigator.canShare({ files: [new File([''], 'test.json', { type: 'application/json' })] })
  } catch {
    return false
  }
}

/**
 * Share the66-state.json via the iOS share sheet so the user can save it to
 * Files › iCloud Drive › Scriptable. Returns true if the share was initiated.
 * Falls back to a data-URI download if share is unavailable.
 */
export async function exportWidgetData(json: string): Promise<boolean> {
  const file = new File([json], FILE_NAME, { type: 'application/json' })

  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'The 66 — Widget Data' })
      return true
    }
  } catch (e) {
    // User cancelled (AbortError) or share failed — not an error
    if (e instanceof Error && e.name === 'AbortError') return false
  }

  // Fallback: trigger browser download
  try {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = FILE_NAME
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return true
  } catch {
    return false
  }
}

// ─── Desktop File System Access path ─────────────────────────────────────────

/**
 * Write the snapshot JSON to the66-state.json in the stored folder.
 * Silently no-ops if not configured, API unavailable, or permission lost.
 * Call fire-and-forget from snapshot.ts.
 */
export async function writeToICloud(json: string): Promise<void> {
  if (!iCloudSyncAvailable()) return
  const handle = await getHandle()
  if (!handle) return

  try {
    // Re-check permission — it may have been revoked
    const perm = await handle.queryPermission({ mode: 'readwrite' })
    if (perm !== 'granted') {
      // Attempt to re-request (requires a user gesture — will usually throw)
      const req = await handle.requestPermission({ mode: 'readwrite' })
      if (req !== 'granted') return
    }

    const fileHandle = await handle.getFileHandle(FILE_NAME, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(json)
    await writable.close()
  } catch {
    // Network error, iCloud unavailable, permission revoked — silent
  }
}
