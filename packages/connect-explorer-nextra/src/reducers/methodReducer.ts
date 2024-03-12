import {
    FIELD_CHANGE,
    FIELD_DATA_CHANGE,
    ADD_BATCH,
    REMOVE_BATCH,
    RESPONSE,
    SET_METHOD,
    SET_SCHEMA,
} from '../actions/methodActions';
import type { Action, Field } from '../types';
import {
    MethodState,
    initialState,
    prepareBundle,
    setAffectedValues,
    updateParams,
} from './methodCommon';
import { getMethodState, getMethodStateFromSchema } from './methodInit';

// Recursively find a field in the schema (inner function)
const findFieldsNested = (
    schema: Field<any>[],
    field: Field<any>,
    currentDepth = 0,
): Field<any> | undefined => {
    if (typeof field.key === 'string') {
        const key = field.key.split('-');
        const bundle = schema.find(f => f.name === key[currentDepth * 2] && f.type === 'array');
        if (bundle?.type !== 'array') {
            return;
        }
        const batch = bundle.items.find(
            (_batch, index) => index === Number.parseInt(key[currentDepth * 2 + 1], 10),
        );
        if (!batch) return;
        if (key.length > currentDepth * 2 + 2) {
            return findFieldsNested(batch, field, currentDepth + 1);
        }

        return batch.find(f => f.name === field.name);
    }

    return schema.find(f => f.name === field.name);
};

// Find a field in the schema
const findField = (state: MethodState, field: Field<any>) => {
    return findFieldsNested(state.fields, field);
};

// Update field value
const onFieldChange = (state: MethodState, _field: Field<any>, value: any) => {
    const newState = {
        ...JSON.parse(JSON.stringify(state)),
        ...state,
    };
    const field = findField(newState, _field);
    if (!field || field.type === 'array') return state;
    field.value = value;
    if (field.affect) {
        setAffectedValues(newState, field);
    }

    return updateParams(newState);
};

// Update field data
const onFieldDataChange = (state: MethodState, _field: Field<any>, data: any) => {
    const newState = state;
    const field = findField(newState, _field);
    if (!field || field.type === 'array') return state;
    field.data = data;

    return updateParams(newState);
};

// Add new batch
const onAddBatch = (state: MethodState, _field: Field<any>, item: any) => {
    const newState = JSON.parse(JSON.stringify(state));
    const field = findField(newState, _field);
    if (!field || field.type !== 'array') return state;
    field.items = [...field.items, item];
    prepareBundle(field);

    return updateParams(newState);
};

// Remove batch
const onRemoveBatch = (state: MethodState, _field: Field<any>, _batch: any) => {
    const field = findField(state, _field);
    if (!field || field.type !== 'array') return state;
    const items = field?.items?.filter(batch => batch !== _batch);

    const newState = JSON.parse(JSON.stringify(state));
    const newField = findField(newState, field);
    if (!newField || newField.type !== 'array') return state;

    newField.items = items;
    prepareBundle(newField);

    return updateParams(newState);
};

export default function method(state: MethodState = initialState, action: Action) {
    switch (action.type) {
        case SET_METHOD:
            return getMethodState(action.methodConfig);

        case SET_SCHEMA:
            return getMethodStateFromSchema(action.method, action.schema);

        case FIELD_CHANGE:
            return onFieldChange(state, action.field, action.value);

        case FIELD_DATA_CHANGE:
            return onFieldDataChange(state, action.field, action.data);

        case ADD_BATCH:
            return onAddBatch(state, action.field, action.item);

        case REMOVE_BATCH:
            return onRemoveBatch(state, action.field, action.batch);

        case RESPONSE:
            return {
                ...state,
                tab: 'response',
                response: action.response,
            };
        default:
            return state;
    }
}
