import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import {
	rdStationApiRequest,
	rdStationApiRequestAllItems,
	keysToSnakeCase,
	sortOptionParameters,
	prepareLeadData,
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
					/* Under development
					{
						name: 'Funnel',
						value: 'funnel',
					},
					*/
				],
				default: 'contact',
			},

			// ----------------------------------
			// ========== OPERATIONS ============
			// ----------------------------------
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
						name: 'Create',
						value: 'create',
						description: 'Create a new contact',
						action: 'Create a contact',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a contact',
						action: 'Update a contact',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a contact',
						action: 'Get a contact',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many contacts',
						action: 'Get many contacts',
					},
				],
				default: 'create',
			},
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
						name: 'Standard Conversion',
						value: 'conversion',
						description: 'Registar a standard conversion event',
						action: 'Standard conversion',
					},
				],
				default: 'conversion',
			},
			// Event fields
			{
				displayName: 'Conversion Identifier',
				name: 'conversion_identifier',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['event'],
						operation: ['conversion'],
					},
				},
				default: '',
				description: 'The name of the conversion event',
			},

			// ----------------------------------
			//         Contacts fields
			// ----------------------------------
			// Doc: https://developers.rdstation.com/reference/contatos

			{
				displayName: 'Contact Identifier',
				name: 'identifier',
				type: 'options',
				options: [
					{
						name: 'UUID',
						value: 'uuid',
					},
					{
						name: 'Email',
						value: 'email',
					},
				],
				default: 'email',
				description: 'It\'s possible to consult the Contacts, using the Lead\'s uuid or email',
				required: true,
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['get', 'update','delete','tag'],
					},
				},
			},
			// Email field for contact:create
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['contact','event'],
						operation: ['create','conversion'],
					},
				},
				default: '',
				placeholder: 'name@email.com',
				description: 'Contact email address',
			},
			// Email field for contact:get, contact:delete, contact:tag, contact:update
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['get','delete','tag','update'],
						identifier: ['email'],
					},
				},
				default: '',
				placeholder: 'name@email.com',
				description: 'Contact email address',
			},
			// Email field as optional for contact:update by UUID
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['update'],
						identifier: ['uuid'],
					},
				},
				default: '',
				placeholder: 'name@email.com',
				description: 'Contact email address',
			},
			{
				displayName: 'UUID',
				name: 'uuid',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['get','delete','tag','update'],
						identifier: ['uuid'],
					},
				},
				default: '',
				placeholder: 'a111bc22-1234-1234-a1a1-ab12c345d67f',
				description: 'Unique contact UUID',
			},
			{
				displayName: 'Sgmentation Name or ID',
				name: 'segmentation_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getSegmentationOptions',
				},
				default: '',
				description:
					'Name of the field to set. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				required: true,
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['getAll'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				displayOptions: {
					show: {
						resource: ['contact','event'],
						operation: ['create', 'update','conversion'],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Bio',
						name: 'bio',
						type: 'string',
						default: '',
						description: 'Notes about this contact',
					},
					{
						displayName: 'Birthday Date',
						name: 'birthdate',
						type: 'dateTime',
						default: '',
						placeholder: '29901-11-23',
					},
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Country',
						name: 'country',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Custom Fields',
						name: 'customFields',
						placeholder: 'Add Custom Field',
						description: 'Adds a custom field to set also values which have not been predefined',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						options: [
							{
								name: 'field',
								displayName: 'Field',
								values: [
									{
										displayName: 'Field Name or ID',
										name: 'name',
										type: 'options',
										typeOptions: {
											loadOptionsMethod: 'getContactCustomFields',
										},
										default: '',
										description:
											'Name of the field to set. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
									},
									{
										displayName: 'Property Value',
										name: 'value',
										type: 'string',
										default: '',
										description: 'Value of the property to set',
									},
								],
							},
						],
					},
					{
						displayName: 'Facebook',
						name: 'facebook',
						type: 'string',
						default: '',
						placeholder: 'https://facebook.com/username',
					},
					{
						displayName: 'Job Title',
						name: 'job_title',
						type: 'string',
						default: '',
						description: 'Contact job position or title',
						placeholder: 'CEO',
					},
					{
						displayName: 'Linkedin',
						name: 'linkedin',
						type: 'string',
						default: '',
						placeholder: 'https://linkedin.com/in/username',
					},
					{
						displayName: 'Mobile Phone',
						name: 'mobile_phone',
						type: 'string',
						default: '',
						placeholder: '+5511999999999',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Contact full name',
						placeholder: 'John Doe',
					},
					{
						displayName: 'Phone',
						name: 'personal_phone',
						type: 'string',
						default: '',
						placeholder: '+5511999999999',
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Tags',
						name: 'tags',
						type: 'string',
						default: '',
						description: 'Comma-separated list of tags. If updating a contact, the tags are replaced by the new tags provided.',
					},
					{
						displayName: 'Twitter',
						name: 'twitter',
						type: 'string',
						default: '',
						placeholder: 'https://x.com/username',
					},
					{
						displayName: 'Website',
						name: 'website',
						type: 'string',
						default: '',
						placeholder: 'https://example.com',
					},
				],
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
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['getAll'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},

		],
	};

	methods = {
		loadOptions: {
			// Get all the Contact Custom Fields to display them to user so that they can
			// select them easily
			async getContactCustomFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const { fields } = await rdStationApiRequest.call(this, 'GET', '/platform/contacts/fields', {});
				for (const field of fields) {
					if (field.custom_field) {
						returnData.push({
							name: field.label.default + " (" + field.api_identifier + ")",
							value: field.api_identifier,
						});
					}
				}
				return sortOptionParameters(returnData);
			},

			// List segmentations to list contacts
			async getSegmentationOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const { segmentations } = await rdStationApiRequest.call(this, 'GET', '/platform/segmentations', {}, {}, { headers: { 'Accept': 'application/json' } });
				for (const segmentation of segmentations) {
					if (segmentation.standard)
						segmentation.name += " (standard)";

					returnData.push({
						name: segmentation.name,
						value: segmentation.id,
					});
				}
				return sortOptionParameters(returnData);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < length; i++) {
			try {
				if (resource === 'contact') {
					// ----------------------------------
					//         CONTACT OPERATIONS
					// ----------------------------------
					if (operation === 'create') {
						// ----------------------------------
						//         contact:create
						// ----------------------------------
						const email = this.getNodeParameter('email', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as any;

						const body: any = {
							email,
							...additionalFields,
						};

						const responseData = await rdStationApiRequest.call(
							this,
							'POST',
							'/platform/contacts',
							keysToSnakeCase(prepareLeadData(body)),
						);

						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
					} else if (operation === 'update') {
						// ----------------------------------
						//         contact:update
						// ----------------------------------
						const identifier = this.getNodeParameter('identifier', i) as | 'uuid' | 'email';
						const email = this.getNodeParameter('email', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as any;

						const body: any = {
							...additionalFields,
						};
						var identifier_value = "" as string;

						if (identifier === 'email') {
							identifier_value = this.getNodeParameter('email', i) as string;
							if (!identifier_value) {
								throw new NodeOperationError(this.getNode(), 'Email is required to update a contact by email');
							}
						}
						else if (identifier === 'uuid') {
							identifier_value = this.getNodeParameter('uuid', i) as string;
							if (!identifier_value) {
								throw new NodeOperationError(this.getNode(), 'UUID is required to update a contact by UUID');
							}
							if (email) {
								body.email = email; // Email is optional when updating by UUID
							}
						}

						const responseData = await rdStationApiRequest.call(
							this,
							'PATCH',
							`/platform/contacts/${identifier}:${identifier_value}`,
							keysToSnakeCase(prepareLeadData(body)),
						);
						delete responseData?.links;

						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
					} else if (operation === 'get') {
						// ----------------------------------
						//         contact:get
						// ----------------------------------
						const identifier = this.getNodeParameter('identifier', i) as | 'uuid' | 'email';
						var identifier_value = "" as string;

						if (identifier === 'email') {
							identifier_value = this.getNodeParameter('email', i) as string;
							if (!identifier_value) {
								throw new NodeOperationError(this.getNode(), 'Email is required to get a contact by email');
							}
						}
						else if (identifier === 'uuid') {
							identifier_value = this.getNodeParameter('uuid', i) as string;
							if (!identifier_value) {
								throw new NodeOperationError(this.getNode(),'UUID is required to get a contact by UUID');
							}
						}

						const responseData = await rdStationApiRequest.call(
							this,
							'GET',
							`/platform/contacts/${identifier}:${identifier_value}`,
						);
						delete responseData?.links;

						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
					} else if (operation === 'getAll') {
						// ----------------------------------
						//         contact:getAll
						// ----------------------------------
						const returnAll = this.getNodeParameter('returnAll', i);
						const page_size = this.getNodeParameter('limit', i, 100) as number;
						const segmentation_id = this.getNodeParameter('segmentation_id', i) as number;

						let responseData;
						if (returnAll) {
							responseData = await rdStationApiRequestAllItems.call(
								this,
								'contacts',
								'GET',
								`/platform/segmentations/${segmentation_id}/contacts`,
							);
						} else {
							responseData = await rdStationApiRequest.call(
								this,
								'GET',
								`/platform/segmentations/${segmentation_id}/contacts`,
								{},
								{ page_size },
							);
						}
						if (responseData?.contacts)
								responseData = responseData.contacts;

						if (Array.isArray(responseData)) {
							responseData.forEach((contact: any) => {
								returnData.push({
									json: contact,
									pairedItem: { item: i },
								});
							});
						} else {
							returnData.push({
								json: responseData,
								pairedItem: { item: i },
							});
						}
					}
				} else if (resource === 'event') {
					// ----------------------------------
					//         EVENT OPERATIONS
					// ----------------------------------
					if (operation === 'conversion') {
						// ----------------------------------
						//         event:conversion
						// ----------------------------------
						const email = this.getNodeParameter('email', i) as string;
						const conversion_identifier = this.getNodeParameter('conversion_identifier', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as any;
						const event_type = "conversion";
						const payload: any = {
								email: email,
									conversion_identifier: conversion_identifier,
									...additionalFields,
							};

						const body = {
							event_type: event_type.toUpperCase(),
							event_family: "CDP",
							payload: payload,
						};

						const responseData = await rdStationApiRequest.call(
							this,
							'POST',
							'/platform/events',
							keysToSnakeCase(prepareLeadData(body)),
							{ event_type: event_type },
						);

						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
					}
				}
			} catch (error: unknown) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : 'Unknown error',
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}