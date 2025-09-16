import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	INodePropertyOptions,
	IHttpRequestOptions,
	IHttpRequestMethods,
	NodeApiError,
} from 'n8n-workflow';

export async function rdStationApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: any = {},
	qs: any = {},
	option: any = { headers: { 'Accept': 'application/json', 'content-type': 'application/json' } },
): Promise<any> {
	const baseUrl = 'https://api.rd.services';
	
	const options: IHttpRequestOptions = {
		method,
		qs,
		body,
		url: `${baseUrl}${resource}`,
		json: true,
		...option,
	};

	try {
		const helpers = this.helpers;
		if (helpers?.httpRequestWithAuthentication) {
			return await helpers.httpRequestWithAuthentication.call(
				this,
				'rdStationMarketingOAuth2Api',
				options,
			);
		}
		throw new Error('HTTP request helper not available');
	} catch (error: unknown) {
		let errorMessage = 'Unknown error occurred';
		let errorDescription = 'An unknown error occurred during the API request';
		
		if (error instanceof Error) {
			errorMessage = error.message;
			errorDescription = error.message;
		}
		
		throw new NodeApiError(this.getNode(), {
			message: errorMessage,
			description: errorDescription,
		} as any);
	}
}

export async function rdStationApiRequestAllItems(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	propertyName: string,
	method: IHttpRequestMethods,
	endpoint: string,
	body: any = {},
	query: any = {},
): Promise<any> {
	const returnData: any[] = [];
	
	let responseData;
	query.page = 1;

	do {
		responseData = await rdStationApiRequest.call(this, method, endpoint, body, query);
		
		if (responseData[propertyName]) {
			returnData.push.apply(returnData, responseData[propertyName]);
		}
		
		query.page++;
	} while (
		responseData[propertyName] &&
		responseData[propertyName].length !== 0 
	);

	return returnData;
}

export function validateJSON(json: string | undefined): any {
	let result;
	try {
		result = JSON.parse(json!);
	} catch (exception) {
		result = undefined;
	}
	return result;
}

export function keysToSnakeCase(obj: any): any {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}
	
	if (Array.isArray(obj)) {
		return obj.map(keysToSnakeCase);
	}
	
	const result: any = {};
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
			result[snakeKey] = keysToSnakeCase(obj[key]);
		}
	}
	
	return result;
}

export function processWebhookData(data: any): any {
	if (!data || typeof data !== 'object') {
		return data;
	}

	// Processa os dados do webhook do RD Station
	if (data.leads && Array.isArray(data.leads)) {
		return data.leads.map((lead: any) => ({
			id: lead.id,
			email: lead.email,
			name: lead.name,
			company: lead.company,
			job_title: lead.job_title,
			phone: lead.phone,
			created_at: lead.created_at,
			updated_at: lead.updated_at,
			tags: lead.tags,
			custom_fields: lead.custom_fields,
		}));
	}

	return data;
}

export function prepareLeadData(obj: any): any {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}
	
	// Tag fields, split comma-separated tags into an array
	if (obj.tags) {
		obj.tags = obj.tags.split(',').map((tag: string) => tag.trim());
	}

	// Prepare Birth Date field
	if (obj.birthdate) {
		obj.birthdate = obj.birthdate.split(' ')[0]; // Format to YYYY-MM-DD
	}

	// Prepare custom fields
	if ( obj.customFields && obj.customFields.field && Array.isArray(obj.customFields.field) ) {
		obj.customFields.field.forEach((item: any) => {
			if (!item.name.startsWith('cf_')) 
				item.name = 'cf_' + item.name; // Ensure custom fields start with 'cf_'
			obj[item.name] = item.value;
		});
		delete obj.customFields;
	}
	console.log('Prepared Lead Data:', obj);
	
	return obj;
}

export function sortOptionParameters(
	optionParameters: INodePropertyOptions[],
): INodePropertyOptions[] {
	optionParameters.sort((a, b) => {
		const aName = a.name.toLowerCase();
		const bName = b.name.toLowerCase();
		if (aName < bName) {
			return -1;
		}
		if (aName > bName) {
			return 1;
		}
		return 0;
	});

	return optionParameters;
}