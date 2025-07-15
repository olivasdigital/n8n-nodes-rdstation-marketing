import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import {
	rdStationMarketingApiRequest,
	rdStationMarketingApiRequestAllItems,
} from './GenericFunctions';

export class RdStationMarketing implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'RD Station Marketing',
		name: 'rdStationMarketing',
		icon: 'file:rdstation.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume RD Station Marketing API',
		defaults: {
			name: 'RD Station Marketing',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'rdStationMarketingOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Event',
						value: 'event',
					},
					{
						name: 'Lead',
						value: 'lead',
					},
					{
						name: 'Opportunity',
						value: 'opportunity',
					},
				],
				default: 'contact',
			},
			// Contact operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['contact'],
					},
				},
				options: [
					{
						name: 'Create or Update',
						value: 'createOrUpdate',
						description: 'Create or update a contact',
						action: 'Create or update a contact',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a contact by email or UUID',
						action: 'Get a contact',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all contacts',
						action: 'Get all contacts',
					},
				],
				default: 'createOrUpdate',
			},
			// Event operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['event'],
					},
				},
				options: [
					{
						name: 'Create Conversion',
						value: 'createConversion',
						description: 'Create a conversion event',
						action: 'Create a conversion event',
					},
					{
						name: 'Create Custom',
						value: 'createCustom',
						description: 'Create a custom event',
						action: 'Create a custom event',
					},
				],
				default: 'createConversion',
			},
			// Lead operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['lead'],
					},
				},
				options: [
					{
						name: 'Get Funnel',
						value: 'getFunnel',
						description: 'Get lead funnel information',
						action: 'Get lead funnel information',
					},
				],
				default: 'getFunnel',
			},
			// Opportunity operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['opportunity'],
					},
				},
				options: [
					{
						name: 'Mark as Won',
						value: 'markAsWon',
						description: 'Mark opportunity as won',
						action: 'Mark opportunity as won',
					},
					{
						name: 'Mark as Lost',
						value: 'markAsLost',
						description: 'Mark opportunity as lost',
						action: 'Mark opportunity as lost',
					},
				],
				default: 'markAsWon',
			},
			// Contact fields
			{
				displayName: 'Contact Email',
				name: 'email',
				type: 'string',
				placeholder: 'contact@example.com',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['createOrUpdate', 'get'],
					},
				},
				default: '',
				required: true,
				description: 'Email of the contact',
			},
			{
				displayName: 'Contact UUID',
				name: 'uuid',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'UUID of the contact (alternative to email)',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['createOrUpdate'],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the contact',
					},
					{
						displayName: 'Job Title',
						name: 'job_title',
						type: 'string',
						default: '',
						description: 'Job title of the contact',
					},
					{
						displayName: 'Phone',
						name: 'mobile_phone',
						type: 'string',
						default: '',
						description: 'Mobile phone of the contact',
					},
					{
						displayName: 'Website',
						name: 'website',
						type: 'string',
						default: '',
						description: 'Website of the contact',
					},
					{
						displayName: 'Personal Phone',
						name: 'personal_phone',
						type: 'string',
						default: '',
						description: 'Personal phone of the contact',
					},
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',
						description: 'City of the contact',
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'string',
						default: '',
						description: 'State of the contact',
					},
					{
						displayName: 'Country',
						name: 'country',
						type: 'string',
						default: '',
						description: 'Country of the contact',
					},
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'string',
						default: '',
						description: 'Tags separated by commas',
					},
				],
			},
			// Event fields
			{
				displayName: 'Event Type',
				name: 'event_type',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['event'],
						operation: ['createConversion', 'createCustom'],
					},
				},
				default: 'CONVERSION',
				description: 'Type of event to create',
			},
			{
				displayName: 'Event Email',
				name: 'email',
				type: 'string',
				placeholder: 'contact@example.com',
				displayOptions: {
					show: {
						resource: ['event'],
						operation: ['createConversion', 'createCustom'],
					},
				},
				default: '',
				required: true,
				description: 'Email of the contact for the event',
			},
			// Limit options
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['getAll'],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 200,
				},
				default: 50,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['getAll'],
					},
				},
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'contact') {
					if (operation === 'createOrUpdate') {
						const email = this.getNodeParameter('email', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as any;

						const body: any = {
							email,
							...additionalFields,
						};

						if (additionalFields.tags) {
							body.tags = additionalFields.tags.split(',').map((tag: string) => tag.trim());
						}

						const responseData = await rdStationMarketingApiRequest.call(
							this,
							'PATCH',
							'/platform/contacts',
							body,
						);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					} else if (operation === 'get') {
						const email = this.getNodeParameter('email', i) as string;
						const uuid = this.getNodeParameter('uuid', i) as string;

						let endpoint = '';
						if (uuid) {
							endpoint = `/platform/contacts/${uuid}`;
						} else {
							endpoint = `/platform/contacts/email:${email}`;
						}

						const responseData = await rdStationMarketingApiRequest.call(
							this,
							'GET',
							endpoint,
						);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const limit = this.getNodeParameter('limit', i) as number;

						if (returnAll) {
							const responseData = await rdStationMarketingApiRequestAllItems.call(
								this,
								'GET',
								'/platform/contacts',
								{},
							);

							returnData.push(...responseData.map((item: any) => ({
								json: item,
								pairedItem: {
									item: i,
								},
							})));
						} else {
							const responseData = await rdStationMarketingApiRequest.call(
								this,
								'GET',
								'/platform/contacts',
								{},
								{ limit },
							);

							returnData.push(...responseData.contacts.map((item: any) => ({
								json: item,
								pairedItem: {
									item: i,
								},
							})));
						}
					}
				} else if (resource === 'event') {
					if (operation === 'createConversion' || operation === 'createCustom') {
						const email = this.getNodeParameter('email', i) as string;
						const eventType = this.getNodeParameter('event_type', i) as string;

						const body: any = {
							event_type: eventType,
							event_family: 'CDP',
							email,
						};

						const responseData = await rdStationMarketingApiRequest.call(
							this,
							'POST',
							'/platform/events',
							body,
						);

						returnData.push({
							json: responseData,
							pairedItem: {
								item: i,
							},
						});
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}