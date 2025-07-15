import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RdStationMarketingOAuth2Api implements ICredentialType {
	name = 'rdStationMarketingOAuth2Api';
	extends = [
		'oAuth2Api',
	];
	displayName = 'RD Station Marketing OAuth2 API';
	documentationUrl = 'https://developers.rdstation.com/reference/autenticação';
	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://api.rd.services/auth/dialog',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://api.rd.services/auth/token',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			description: 'Client ID obtido ao criar o aplicativo na RD Station App Store',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Client Secret obtido ao criar o aplicativo na RD Station App Store',
		},
	];

	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject): Promise<IDataObject> {
		// Adiciona parâmetros específicos do RD Station na URL de autorização
		const authUrl = new URL(credentials.authUrl as string);
		authUrl.searchParams.set('client_id', credentials.clientId as string);
		authUrl.searchParams.set('redirect_uri', credentials.redirectUri as string);
		authUrl.searchParams.set('response_type', 'code');
		
		return {
			...credentials,
			authUrl: authUrl.toString(),
		};
	}

	async authenticate(this: ICredentialType, options: any) {
		// Customiza a requisição de token para seguir o formato do RD Station
		const body = {
			client_id: options.clientId,
			client_secret: options.clientSecret,
			code: options.code,
			redirect_uri: options.redirectUri,
		};

		const tokenResponse = await fetch(options.accessTokenUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		const tokenData = await tokenResponse.json();

		if (!tokenResponse.ok) {
			throw new Error(`Token request failed: ${tokenData.error || 'Unknown error'}`);
		}

		return {
			access_token: tokenData.access_token,
			refresh_token: tokenData.refresh_token,
			expires_in: tokenData.expires_in,
		};
	}

	async refreshAccessToken(this: ICredentialType, options: any) {
		// Implementa o refresh token para RD Station
		const body = {
			client_id: options.clientId,
			client_secret: options.clientSecret,
			refresh_token: options.refreshToken,
		};

		const refreshResponse = await fetch('https://api.rd.services/auth/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		const refreshData = await refreshResponse.json();

		if (!refreshResponse.ok) {
			throw new Error(`Token refresh failed: ${refreshData.error || 'Unknown error'}`);
		}

		return {
			access_token: refreshData.access_token,
			refresh_token: refreshData.refresh_token,
			expires_in: refreshData.expires_in,
		};
	}
}