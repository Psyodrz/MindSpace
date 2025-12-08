// Export the current state as a downloadable JSON file
export function exportToJSON(state: unknown, filename = 'mindspace-backup.json') {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import state from a JSON file
export function importFromJSON(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        resolve(data);
      } catch (err) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    input.click();
  });
}

// Clear all persisted data
export async function clearAllData(storageKey: string) {
  const { del } = await import('idb-keyval');
  await del(storageKey);
}
