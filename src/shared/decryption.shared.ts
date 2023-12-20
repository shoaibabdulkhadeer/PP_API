import * as crypto from 'crypto';

export function decryptPassword(password: string): any {
	const rsaPrivateKey = {
		key: process.env.PASSWORD_PRIVATE_KEY,
		passphrase: '',
		padding: crypto.constants.RSA_PKCS1_PADDING
	};

	const decryptedMessage = crypto.privateDecrypt(rsaPrivateKey, Buffer.from(password, 'base64'));

	return decryptedMessage.toString('utf8');
}
