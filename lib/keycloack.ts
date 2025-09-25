import Keycloak, { KeycloakInitOptions, KeycloakOnLoad } from "keycloak-js";

class KeycloakSingleton {
	private static instance: Keycloak;

	static getInstance() {
		if (!KeycloakSingleton.instance) {
			KeycloakSingleton.instance = new Keycloak({
				url: process.env.NEXT_PUBLIC_KEYCLOAK_URL as string,
				realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM as string,
				clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID as string
			});
		}
		return KeycloakSingleton.instance;
	}
}

export class KeycloakService {
	async init() {
		const kc = KeycloakSingleton.getInstance();
		const options: KeycloakInitOptions = {
			redirectUri: "http://localhost:3000/dashboard",
			onLoad: "check-sso" as KeycloakOnLoad,
			silentCheckSsoRedirectUri:
				typeof window !== "undefined"
					? `${window.location.origin}/silent-check-sso.html`
					: undefined
		};
		const authenticated = await kc.init(options);
		return authenticated;
	}
}

export { KeycloakSingleton };