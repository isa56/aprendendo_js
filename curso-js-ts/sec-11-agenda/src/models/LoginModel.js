const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");

const LoginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const LoginModel = mongoose.model("Login", LoginSchema);

class Login {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.user = null;
  }

  async createAccount() {
    this.validateData();
    if (this.errors.length > 0) return;

    await this.userExists();
    if (this.errors.length > 0) return;

    const salt = bcryptjs.genSaltSync();
    this.body.password = await bcryptjs.hashSync(this.body.password, salt);

    try {
      this.user = await LoginModel.create(this.body);
    } catch (e) {
      console.log(e);
    }
  }

  async userExists() {
    let user = await LoginModel.findOne({ email: this.body.email });
    if (user) {
      this.errors.push("Usuário já existe.");
    }
  }

  cleanUp() {
    for (const key in this.body) {
      if (typeof this.body[key] !== "string") {
        this.body[key] = "";
      }
    }
    this.body = {
      email: this.body.email,
      password: this.body.password,
    };
  }

  validateData() {
    this.cleanUp();
    // Validação
    // O e-mail precisa ser válido
    if (!validator.isEmail(this.body.email))
      this.errors.push("E-mail precisa ser válido.");
    if (this.body.password.length < 5 || this.body.password.length > 50)
      this.errors.push("Senha deve ter entre 5 e 50 caracteres.");
  }
}

module.exports = Login;
