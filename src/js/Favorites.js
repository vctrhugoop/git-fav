import { GithubUser } from './GithubUser.js';

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username);

      if (userExists) {
        throw new Error('User already added to favorites!');
      }

      const user = await GithubUser.search(username);

      if (user.login === undefined) {
        throw new Error('User not found!');
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();

      Toastify({
        text: 'User added to favorites!',
        duration: 3000,
        close: true,
        style: {
          background: 'linear-gradient(to right, #00b09b, #96c93d)',
        },
      }).showToast();
    } catch (error) {
      Toastify({
        text: error.message,
        duration: 3000,
        close: true,
        style: {
          background: 'linear-gradient(to right,#fdc22d, #cbbf05)',
        },
      }).showToast();
    }

    this.root.querySelector('.input-wrapper input').value = '';
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    );

    this.entries = filteredEntries;

    this.update();

    this.save();

    Toastify({
      text: 'User removed from favorites!',
      duration: 3000,
      close: true,
      style: {
        background: 'linear-gradient(to right, #e62121, #fd9e2d)',
      },
    }).showToast();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector('table tbody');

    this.update();
    this.onadd();
  }

  onadd() {
    const input = document.querySelector('.input-wrapper input');
    const addButton = document.querySelector('.input-wrapper button');

    addButton.onclick = () => {
      this.add(input.value);
    };

    input.addEventListener('keypress', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addButton.click();
      }
    });
  }

  update() {
    this.emptyState();

    this.removeAllTr();

    this.entries.forEach(user => {
      const row = this.createRow();

      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`;

      row.querySelector('.user a').href = `https://github.com/${user.login}`;

      row.querySelector('.user p').textContent = user.name;

      row.querySelector('.user span').textContent = `/${user.login}`;

      row.querySelector('.repositories').textContent = user.public_repos;

      row.querySelector('.followers').textContent = user.followers;

      row.querySelector('.btn-remove').onclick = () => {
        const isOk = confirm('Are you sure you want to remove this user?');

        if (isOk) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });

    this.root.querySelector('.input-wrapper input').value = '';
  }

  createRow() {
    const tr = document.createElement('tr');

    tr.innerHTML = ` 
      <td class="user">
        <img
          src="https://avatars.githubusercontent.com/u/37374182?v=4"
          alt=""
        />
        <a href="https://github.com/vctrhugoop" target="_blank"
          ><p>Victor Oliveira</p>
          <span>/vctrhugoop</span></a
        >
      </td>
      <td class="repositories">33</td>
      <td class="followers">12</td>
      <td class="btn-remove">
        <button>
          <lord-icon
            src="https://cdn.lordicon.com/skkahier.json"
            trigger="hover"
            colors="primary:#F75A68"
            style="width: 24px; height: 24px"
          >
          </lord-icon>
        </button>
      </td>
   `;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove();
    });
  }

  emptyState() {
    if (this.entries.length === 0) {
      this.root.querySelector('.no-fav').classList.remove('hide');
    } else {
      this.root.querySelector('.no-fav').classList.add('hide');
    }
  }
}
