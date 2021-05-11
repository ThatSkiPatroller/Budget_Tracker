let db;

const request = window.indexedDB.open('BudgetTrackerDB', 1);

request.onupgradeneeded = function (e) {
  db = e.target.result;

  db.createObjectStore('BudgetStore', { autoIncrement: true });
};

request.onerror = function (e) {
  console.log(`Error: ${e.target.errorCode}`);
};

function checkDatabase() {
  console.log('check db invoked');

  let transaction = db.transaction(['BudgetStore'], 'readwrite');

  const store = transaction.objectStore('BudgetStore');

  const getAll = store.getAll();

  getAll.onsuccess = function () {
    
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {

          if (res.length !== 0) {
           
            transaction = db.transaction(['BudgetStore'], 'readwrite');

            const currentStore = transaction.objectStore('BudgetStore');

            currentStore.clear();
            console.log('Clearing store 🧹');
          }
        });
    }
  };
}

request.onsuccess = function (e) {
  console.log('success');
  db = e.target.result;

  if (navigator.onLine) {
    console.log('Backend online');
    checkDatabase();
  }
};

const saveRecord = (record) => {
  const transaction = db.transaction(['BudgetStore'], 'readwrite');

  const store = transaction.objectStore('BudgetStore');

  store.add(record);
};

window.addEventListener('online', checkDatabase);