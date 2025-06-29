async function fetchClients() {
    const response = await fetch('http://localhost:5000/clients');
    const clients = await response.json();
    
    let html = '<table><tr><th>Name</th><th>Code</th><th>Linked Contacts</th></tr>';
    clients.forEach(client => {
        html += `<tr>
            <td>${client.name}</td>
            <td>${client.code}</td>
            <td>
                <button onclick="showClientContacts(${client.id})">View Contacts</button>
                <button onclick="showLinkContactForm(${client.id})">Link Contact</button>
                <button onclick="deleteClient(${client.id})" style="background:#dc3545;">Delete</button>
            </td>
        </tr>`;
    });
    html += '</table>';

    document.getElementById('client-list').innerHTML = 
        clients.length ? html : '<p>No client(s) found.</p>';
}

// Load on startup
document.addEventListener('DOMContentLoaded', fetchClients);

function showTab(tab) {
    document.getElementById('clients').style.display = (tab === 'clients') ? 'block' : 'none';
    document.getElementById('contacts').style.display = (tab === 'contacts') ? 'block' : 'none';

    // Highlight active tab
    document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tabs button[onclick="showTab('${tab}')"]`).classList.add('active');
}

function loadClients() {
    fetch('../backend/clients.php?action=list')
        .then(response => response.json())
        .then(data => {
            const listDiv = document.getElementById('client-list');
            if (data.length === 0) {
                listDiv.innerHTML = '<p>No client(s) found.</p>';
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
        const response = await fetch('http://localhost:5000/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: formData.get('name') })
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

async function showClientContacts(clientId) {
    const response = await fetch(`http://localhost:5000/clients/${clientId}/contacts`);
    const contacts = await response.json();
    let html = '';
    if (contacts.length === 0) {
        html = '<p>No contacts found.</p>';
    } else {
        html = '<table><tr><th>Full Name</th><th>Email</th><th></th></tr>';
        contacts.forEach(contact => {
            const fullName = `${contact.surname} ${contact.name}`;
            html += `<tr>
                <td style="text-align:left;">${fullName}</td>
                <td style="text-align:left;">${contact.email}</td>
                <td style="text-align:left;">
                    <a href="#" onclick="unlinkContact(${clientId}, ${contact.id});return false;">Unlink</a>
                </td>
            </tr>`;
        });
        html += '</table>';
    }
    document.getElementById('client-contacts-list').innerHTML = html;
}

async function unlinkContact(clientId, contactId) {
    await fetch(`http://localhost:5000/client_contact/unlink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, contact_id: contactId })
    });
    showClientContacts(clientId); // Refresh the list
}

async function showLinkContactForm(clientId) {
    // Fetch all contacts
    const allContactsRes = await fetch('http://localhost:5000/contacts');
    const allContacts = await allContactsRes.json();

    // Fetch already linked contacts
    const linkedRes = await fetch(`http://localhost:5000/clients/${clientId}/contacts`);
    const linkedContacts = await linkedRes.json();
    const linkedIds = new Set(linkedContacts.map(c => c.id));

    // Filter out already linked contacts
    const unlinkedContacts = allContacts.filter(c => !linkedIds.has(c.id));

    let html = '<h4>Link a Contact</h4>';
    if (unlinkedContacts.length === 0) {
        html += '<p>No unlinked contact(s) available.</p>';
    } else {
        html += `<form id="link-contact-form">
            <select name="contact_id" required>
                <option value="">Select contact</option>
                ${unlinkedContacts.map(c => `<option value="${c.id}">${c.surname} ${c.name} (${c.email})</option>`).join('')}
            </select>
            <button type="submit">Link</button>
            <button type="button" onclick="hideLinkContactForm()">Cancel</button>
        </form>
        <div id="link-contact-error" style="color:red;"></div>`;
    }
    document.getElementById('client-contacts-list').innerHTML = html;

    const form = document.getElementById('link-contact-form');
    if (form) {
        form.onsubmit = async function(e) {
            e.preventDefault();
            const contactId = form.contact_id.value;
            const response = await fetch('http://localhost:5000/client_contact/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id: clientId, contact_id: contactId })
            });
            const result = await response.json();
            if (result.success) {
                showClientContacts(clientId);
            } else {
                document.getElementById('link-contact-error').textContent = result.error || 'Error linking contact.';
            }
        };
    }
}

function hideLinkContactForm() {
    document.getElementById('client-contacts-list').innerHTML = '';
}

async function deleteClient(clientId) {
    if (!confirm('Are you sure you want to delete this client?')) return;
    await fetch(`http://localhost:5000/clients/${clientId}`, {
        method: 'DELETE'
    });
    fetchClients();
}