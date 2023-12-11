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
        throw new Error('Usuário já cadastrado!');
      }

      const user = await GithubUser.search(username);

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!');
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
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
    const addButton = document.querySelector('.input-wrapper button');

    addButton.onclick = () => {
      const { value } = this.root.querySelector('.input-wrapper input');

      this.add(value);
    };
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
        const isOk = confirm('Tem certeza que deseja deletar essa linha?');

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
