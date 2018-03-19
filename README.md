### RESTful-APIs in Node/Express

A Todo application to demostrate RESTful-APIs.

Developed in Node.js, Express.js and MongoDB.

User can signup and login the application.  
After login, they can peform CRUD operations. 

[JsonWebToken](https://jwt.io/) is used for authentication.

BCrypt is used for password encryption.

Once a user is sign up then they will get back a token from JWT.  
Below is the code for creating that token:

```node
UserSchema.methods.generateAuthToken = function() {
	const user = this;
	const access = 'auth';
	const token = jwt.sign({
			_id: user._id.toHexString(),
			access
		}, 'secret').toString();

	user.tokens = user.tokens.concat([{ access, token }]);

	return user.save().then(() => {
		return token;
	});

}
```

When the user, login then the plain password is hashed and compared with the password in the MongoDB.  
Below is the code for that:

```node
UserSchema.statics.findByCredentials = function(email, password) {
	const User = this;

	return User.findOne({ email })
		.then((user) => {
			if (!user) {
				return Promise.reject();
			}

			return new Promise((resolve, reject) => {
				bcrypt.compare(password, user.password, (err, res) => {
					if (res) {
						resolve(user);
					} else {
						reject();
					}
				});
			});
	});	
}
```
