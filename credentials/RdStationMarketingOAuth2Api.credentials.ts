import {
	ICredentialType,
	INodeProperties,
	ICredentialDataDecryptedObject,
	IHttpRequestOptions,
} from 'n8n-workflow';

export class RdStationMarketingOAuth2Api implements ICredentialType {
	name = 'rdStationMarketingOAuth2Api';
	extends = ['oAuth2Api'];
	displayName = 'RD Station Marketing OAuth2 API';
	documentationUrl = 'https://developers.rdstation.com/reference/autentica%C3%A7%C3%A3o';
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
			required: true,
			default: '',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			required: true,
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const oauthTokenData = credentials.oauthTokenData as any;
		const accessToken = oauthTokenData?.access_token;
		
		if (!accessToken) {
			throw new Error('No access token available');
		}
		
		requestOptions.headers = {
			...requestOptions.headers,
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		};

		return requestOptions;
	}
}