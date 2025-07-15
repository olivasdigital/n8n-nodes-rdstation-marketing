import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	IHttpRequestOptions,
	IDataObject,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

export async function rdStationMarketingApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	method: string,
	resource: string,
	body: any = {},
	qs: IDataObject = {},
	option: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('rdStationMarketingOAuth2Api');

	const options: IHttpRequestOptions = {
		method,
		body,
		qs,
		url: `https://api.rd.services${resource}`,
		json: true,
		...option,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	if (Object.keys(qs).length === 0) {
		delete options.qs;
	}

	try {
		const responseData = await this.helpers.requestOAuth2.call(this, 'rdStationMarketingOAuth2Api', options);
		return responseData;
	} catch (error) {
		if (error.response?.body?.errors) {
			const errorMessage = error.response.body.errors.map((err: any) => err.error_message || err.message).join(', ');
			throw new NodeApiError(this.getNode(), error, {
				message: errorMessage,
				description: error.response.body.error_description || 'RD Station Marketing API Error',
			});
		}
		
		throw new NodeApiError(this.getNode(), error);
	}
}

export async function rdStationMarketingApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: any = {},
	query: IDataObject = {},
): Promise<any> {
	const returnData: IDataObject[] = [];
	
	let responseData;
	query.limit = 200;
	query.page = 1;

	do {
		responseData = await rdStationMarketingApiRequest.call(this, method, endpoint, body, query);
		
		if (responseData.contacts) {
			returnData.push.apply(returnData, responseData.contacts);
		} else if (Array.isArray(responseData)) {
			returnData.push.apply(returnData, responseData);
		} else {
			returnData.push(responseData);
		}

		query.page = query.page + 1;
	} while (responseData.has_more === true);

	return returnData;
}

export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function validateUUID(uuid: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(uuid);
}

export function formatTags(tags: string): string[] {
	if (!tags) return [];
	return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
}

export function sanitizeContactData(data: IDataObject): IDataObject {
	const sanitized: IDataObject = {};
	
	// Remove campos vazios e nulos
	Object.keys(data).forEach(key => {
		if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
			sanitized[key] = data[key];
		}
	});

	// Validar email se presente
	if (sanitized.email && !validateEmail(sanitized.email as string)) {
		throw new NodeOperationError(
			{ type: 'RD Station Marketing', name: 'RD Station Marketing' },
			'Invalid email format provided'
		);
	}

	// Formatar tags se presente
	if (sanitized.tags && typeof sanitized.tags === 'string') {
		sanitized.tags = formatTags(sanitized.tags as string);
	}

	return sanitized;
}

export function formatRdStationError(error: any): string {
	if (error.response?.body?.errors) {
		return error.response.body.errors.map((err: any) => {
			if (err.error_message) return err.error_message;
			if (err.message) return err.message;
			return 'Unknown error';
		}).join(', ');
	}
	
	if (error.response?.body?.error_description) {
		return error.response.body.error_description;
	}
	
	if (error.response?.body?.error) {
		return error.response.body.error;
	}
	
	return error.message || 'Unknown RD Station Marketing API error';
}