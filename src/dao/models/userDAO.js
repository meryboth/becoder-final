import MongoManager from '../managers/mongoManager.js';
import FileSystemManager from '../managers/filesystemManager.js';
import { userSchema } from '../../models/user.model.js'; // Importar el esquema
import { v4 as uuidv4 } from 'uuid';

class UserDAO {
  constructor(dataSource) {
    if (dataSource === 'mongo') {
      this.model = MongoManager.connection.model('users', userSchema);
    } else if (dataSource === 'fileSystem') {
      this.fileSystem = FileSystemManager;
      this.filePath = 'users.json';
      this._ensureFileExists(); // Asegurar que el archivo exista
    }
    console.log(`UserDAO initialized with dataSource: ${dataSource}`); // Depuración
  }

  _ensureFileExists() {
    const fullPath = this.fileSystem._getPath(this.filePath);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, JSON.stringify([])); // Crear un archivo vacío
      console.log('Created file at:', fullPath); // Depuración
    }
  }

  async createUser(userData) {
    console.log('Creating user:', userData); // Depuración
    if (this.model) {
      const user = new this.model(userData);
      const savedUser = await user.save();
      console.log('Saved user in MongoDB:', savedUser); // Depuración
      return savedUser;
    } else if (this.fileSystem) {
      try {
        const users = (await this.fileSystem.readFile(this.filePath)) || [];
        const newUser = { _id: uuidv4(), ...userData };
        users.push(newUser);
        console.log('Writing new user to file:', newUser); // Depuración
        await this.fileSystem.writeFile(this.filePath, users);
        console.log('New user written to file:', newUser); // Depuración
        return newUser;
      } catch (err) {
        console.error('Error creating user in filesystem:', err); // Depuración
        throw err;
      }
    }
  }

  async getUserById(userId) {
    console.log('Getting user by ID:', userId); // Depuración
    if (this.model) {
      const user = await this.model.findById(userId).populate('cart');
      console.log('User found in MongoDB:', user); // Depuración
      return user;
    } else if (this.fileSystem) {
      const users = (await this.fileSystem.readFile(this.filePath)) || [];
      const user = users.find((user) => user._id === userId);
      console.log('User found in filesystem:', user); // Depuración
      return user;
    }
  }

  async getUserByEmail(email) {
    console.log('Getting user by email:', email); // Depuración
    if (this.model) {
      const user = await this.model.findOne({ email }).populate('cart');
      console.log('User found in MongoDB:', user); // Depuración
      return user;
    } else if (this.fileSystem) {
      const users = (await this.fileSystem.readFile(this.filePath)) || [];
      const user = users.find((user) => user.email === email);
      console.log('User found in filesystem:', user); // Depuración
      return user;
    }
  }

  async getUserByResetToken(token) {
    console.log('Getting user by reset token:', token); // Depuración
    if (this.model) {
      const user = await this.model.findOne({ 'resetToken.token': token });
      console.log('User found in MongoDB:', user); // Depuración
      return user;
    } else if (this.fileSystem) {
      const users = (await this.fileSystem.readFile(this.filePath)) || [];
      const user = users.find((user) => user.resetToken.token === token);
      console.log('User found in filesystem:', user); // Depuración
      return user;
    }
  }
}

export default UserDAO;
