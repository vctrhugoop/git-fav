export class GithubUser {
  static async search(username) {
    const endpoint = `https://api.github.com/users/${username}`;

    const data = await fetch(endpoint);
    const { login, name, public_repos, followers } = await data.json();
    return {
      login,
      name,
      public_repos,
      followers,
    };
  }
}
