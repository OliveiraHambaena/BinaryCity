async function fetchClients() {
    const response = await fetch('../api/clients/list.php');
    const clients = await response.json();
    
    let html = '<table><tr><th>Name</th><th>Code</th><th>Linked Contacts</th></tr>';
    clients.forEach(client => {
        html += `<tr>
            <td>${client.name}</td>
            <td>${client.code}</td>
            <td>${client.contact_count || 0}</td>
        </tr>`;
    });
    html += '</table>';

    document.getElementById('client-list').innerHTML = 
        clients.length ? html : '<p>No clients found.</p>';
}

// Load on startup
document.addEventListener('DOMContentLoaded', fetchClients);

function showTab(tab) {
    document.getElementById('clients').style.display = (tab === 'clients') ? 'block' : 'none';
    document.getElementById('contacts').style.display = (tab === 'contacts') ? 'block' : 'none';
}

function loadClients() {
    fetch('../backend/clients.php?action=list')
        .then(response => response.json())
        .then(data => {
            const listDiv = document.getElementById('client-list');
            if (data.length === 0) {
                listDiv.innerHTML = '<p>No clients found.</p>';
                return;
            }
            let html = '<table><tr><th>Name</th><th>Code</th></tr>';
            data.forEach(client => {
                html += `<tr><td>${client.name}</td><td>${client.code}</td></tr>`;
            });
            html += '</table>';
            listDiv.innerHTML = html;
        });
}

function loadClientForm() {
    const formHtml = `
        <form id="client-form">
            <label>Name: <input type="text" name="name" required></label>
            <button type="submit">Save</button>
            <button type="button" onclick="hideClientForm()">Cancel</button>
        </form>
        <div id="client-form-error" style="color:red;"></div>
    `;
    document.getElementById('client-form-container').innerHTML = formHtml;
    document.getElementById('client-form-container').style.display = 'block';

    document.getElementById('client-form').onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const response = await fetch('../backend/clients.php?action=add', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success) {
            hideClientForm();
            loadClients();
        } else {
            document.getElementById('client-form-error').textContent = result.error || 'Error adding client.';
        }
    };
}

function hideClientForm() {
    document.getElementById('client-form-container').style.display = 'none';
}