document.getElementById('show-login').addEventListener('click', () => {
    document.getElementById('login').style.display = 'block';
    document.getElementById('register').style.display = 'none';
});

document.getElementById('show-register').addEventListener('click', () => {
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'block';
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    alert(data.message);
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();

    if (data.auth) {
        localStorage.setItem('token', data.token);
        document.getElementById('login').style.display = 'none';
        document.getElementById('register').style.display = 'none';
        document.getElementById('memories').style.display = 'block';
        loadMemories();
    } else {
        alert('Login failed');
    }
});

document.getElementById('memory-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const image = document.getElementById('image').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) formData.append('image', image);

    const token = localStorage.getItem('token');
    const response = await fetch('/memories', {
        method: 'POST',
        headers: { 'x-access-token': token },
        body: formData
    });

    const data = await response.json();
    if (data.message === 'Memory saved') {
        loadMemories();
    } else {
        alert('Failed to save memory');
    }
});

async function loadMemories() {
    const token = localStorage.getItem('token');
    const response = await fetch('/memories', {
        headers: { 'x-access-token': token }
    });
    const memories = await response.json();

    const memoryList = document.getElementById('memory-list');
    memoryList.innerHTML = '';

    memories.forEach(memory => {
        const memoryDiv = document.createElement('div');
        memoryDiv.classList.add('memory');
        memoryDiv.innerHTML = `
            <h3>${memory.title}</h3>
            <p>${memory.content}</p>
            ${memory.image_path ? `<img src="${memory.image_path}" alt="${memory.title}" style="max-width: 100%;">` : ''}
            <small>${new Date(memory.created_at).toLocaleString()}</small>
        `;
        memoryList.appendChild(memoryDiv);
    });
}
