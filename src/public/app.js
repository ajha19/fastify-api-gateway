async function checkHealth() {
    await makeRequest('/health', 'GET');
}

async function testProxyFast() {
    await makeRequest('/api/users', 'GET');
}

async function testProxySlow() {
    await makeRequest('/api/slow', 'GET');
}

async function makeRequest(url, method) {
    const responseArea = document.getElementById('response-area');
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);

    // Clear placeholder if first request
    if (responseArea.innerText.includes('Click actions above')) {
        responseArea.innerHTML = '';
    }

    try {
        const start = performance.now();
        const res = await fetch(url, { method });
        const duration = (performance.now() - start).toFixed(0);

        let data;
        try {
            data = await res.json();
        } catch (e) {
            data = { error: 'Failed to parse JSON' };
        }

        const statusClass = res.status >= 500 ? 'status-5xx' : res.status >= 400 ? 'status-4xx' : 'status-2xx';

        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `
      <div>
        <span class="log-time">[${timestamp}]</span>
        <span class="log-method">${method}</span>
        <span>${url}</span>
        <span class="log-status ${statusClass}" style="float: right;">${res.status} (${duration}ms)</span>
      </div>
      <pre style="color: var(--text-secondary); margin: 0.5rem 0 0 0;">${JSON.stringify(data, null, 2)}</pre>
    `;

        responseArea.insertBefore(entry, responseArea.firstChild);

        // Update health indicator specifically
        if (url === '/health') {
            const ind = document.getElementById('health-indicator');
            const text = document.getElementById('health-status');
            if (res.ok) {
                ind.className = 'status-indicator status-ok';
                text.innerText = 'Operational';
                text.style.color = 'var(--success)';
            } else {
                ind.className = 'status-indicator status-error';
                text.innerText = 'Down';
                text.style.color = 'var(--error)';
            }
        }

    } catch (err) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `
      <div>
        <span class="log-time">[${timestamp}]</span>
        <span class="status-5xx">Network Error</span>
      </div>
      <pre style="color: var(--error);">${err.message}</pre>
    `;
        responseArea.insertBefore(entry, responseArea.firstChild);
    }
}

// Initial health check
checkHealth();
