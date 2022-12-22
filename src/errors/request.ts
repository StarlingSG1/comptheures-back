export const MISSING_FIELDS = (fields: string[]) => ({
    code: 'E010',
    status: 400,
    message: `Missing mandatory fields: ${fields.join(', ')}`
  })
  
  export const UNKNOWN_RESOURCE = (name: string, field: { name: string, value: unknown }) => ({
    code: 'E011',
    status: 400,
    message: `Unknown ${name} with ${field.name}:${field.value}`
  })

  export const BAD_REQUEST = (message: string) => ({
    code: 'E012',
    status: 400,
    message,
  })