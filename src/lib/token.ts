import * as jwt from "jsonwebtoken";
import { TokenUserType } from "../modules/auth/schema-type";

const tokenSecretKey = process.env.TOKEN_SECRET_KEY;
const expiresIn = process.env.TOKEN_EXPIRATION as string;

export function signToken(user: TokenUserType) {
  try {
    const payload = { sub: user.id };

    if (!tokenSecretKey) {
      throw new Error("Failed to sign token. Token secret key is not setup");
    }

    const token = jwt.sign(payload, tokenSecretKey, {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    });
    return token;
  } catch (error) {
    throw new Error(`Failed to sign token: ${error}`);
  }
}

export function verifyToken(token: string) {
  try {
    if (!tokenSecretKey) {
      throw new Error("Failed to sign token. Token secret key is not setup");
    }

    const payload = jwt.verify(token, tokenSecretKey);

    return payload;
  } catch (error) {
    throw new Error(`Failed to verify token: ${error}`);
  }
}
