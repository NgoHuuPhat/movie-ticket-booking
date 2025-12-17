
export async function generateIncrementalId(
  model: any,
  field: string,
  prefix: string,
  padLength = 2
) : Promise<string> {
  const lastRecord = await model.findFirst({
    orderBy: {
      [field]: 'desc'
    }
  })

  if(!lastRecord) {
    return `${prefix}${'1'.padStart(padLength, '0')}`
  }

  const lastId: string = lastRecord[field]
  const numericPart = parseInt(lastId.replace(prefix, ''))
  const newNumericPart = (numericPart + 1).toString().padStart(padLength, '0')
  return `${prefix}${newNumericPart}`
}