class AppRepository {
  constructor(dao) {
    this.dao = dao;
  }

  createUser(name, email, password, region, creation_time) {
    return this.dao.doRun(`INSERT INTO users (name, email, password, region, creation_time)
      VALUES (?, ?, ?, ?, ?)`, [name, email, password, region, creation_time]);
  }

  createAdmin(email, password, creation_time) {
    return this.dao.doRun(`INSERT INTO admins (email, password, creation_time)
      VALUES (?, ?, ?)`, [email, password, creation_time]);
  }

  createAward(recipient_name, recipient_email, creation_time, award_type) {
    return this.dao.doRun(`INSERT INTO awards (recipient_name, recipient_email, creation_time, award_type)
      VALUES(?, ?, ?, ?)`, [recipient_name, recipient_email, creation_time, award_type]);
  }

  getUserByName(name) {
    return this.dao.doGet(`SELECT * FROM users WHERE name = ?`, [name]);
  }

  getUserById(id) {
    return this.dao.doGet(`SELECT * FROM users WHERE id = ?`, [id]);
  }

  getAllUsers() {
    return this.dao.doGetAll(`SELECT * FROM users`);
  }

  updateUsersName(id, newName) {
    return this.dao.run(`UPDATE users SET name = ? WHERE id = ?`, [newName, id]);
  }

  deleteUser(id) {
    return this.dao.run(`DELETE FROM users WHERE id = ?`, [id]);
  }

  getAdmin(id) {
    return this.dao.doGet(`SELECT * FROM admins WHERE id = ?`, [id]);
  }

  getAllAdmins() {
    return this.dao.doGetAll(`SELECT * FROM admins`);
  }

  getAward(id) {
    return this.dao.doGet(`SELECT * FROM awards WHERE id = ?`, [id]);
  }

  getAllAwards() {
    return this.dao.doGetAll(`SELECT * FROM awards`);
  }

  createUsersTable() {
    return this.dao.doRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        password TEXT,
        region TEXT,
        last_login TEXT,
        sig_image_path TEXT,
        creation_time TEXT)`
    );
  }

  createAdminsTable() {
    return this.dao.doRun(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        password TEXT,
        last_login TEXT,
        login_attempts TEXT,
        creation_time TEXT)`
    );
  }

  createAwardsTable() {
    return this.dao.doRun(`
      CREATE TABLE IF NOT EXISTS awards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipient_name TEXT,
        recipient_email TEXT,
        award_type INTEGER,
        creation_time TEXT,
        creator_id INTEGER,
        FOREIGN KEY(creator_id) REFERENCES users(id)
      )`)
  }

  createRepo() {
    return this.createUsersTable()
      .then(() => this.createAdminsTable())
      .then(() => this.createAwardsTable())
      .then(() => console.log('Successfully created all database tables'))
      .catch((error) => console.log('Error creating database tables: ', error));
  }
}

module.exports = AppRepository
