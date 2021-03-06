const { OptionalValueFeature, BaseSubsetValidationFeature, GeneratorOptionCleanFeature, SchemaInstanceValidationFeature, SchemaValidationResultCacheFeature } = require('../features')
const _optional = OptionalValueFeature.optionalSymbol
const _max = Symbol('max')
const _min = Symbol('min')
const _divisibleBy = Symbol('divisibleBy')

const initialValues = {
  [_divisibleBy]: 0,
  [_max]: Infinity,
  [_min]: -Infinity
}

const NumberSchemaMaker = {
  buildSchema (otherNumber) {
    const obj = Object.create(this.instanceProperties)
    obj[_divisibleBy] = otherNumber[_divisibleBy]
    obj[_max] = otherNumber[_max]
    obj[_min] = otherNumber[_min]
    return obj
  },

  instanceProperties: {
    get info () {
      return {
        schemaName: 'NumberSchema',
        max: this[_max],
        min: this[_min],
        divisibleBy: this[_divisibleBy]
      }
    },

    max (maximum) { return Object.assign(NumberSchemaMaker.buildSchema(this), { [_max]: maximum }) },
    min (minimum) { return Object.assign(NumberSchemaMaker.buildSchema(this), { [_min]: minimum }) },
    divisibleBy (num) { return Object.assign(NumberSchemaMaker.buildSchema(this), { [_divisibleBy]: num }) },
    integer () { return Object.assign(NumberSchemaMaker.buildSchema(this), { [_divisibleBy]: 1 }) },
    positive () { return Object.assign(NumberSchemaMaker.buildSchema(this), { [_min]: 0 }) },

    get errors () {
      const errors = []
      const isMaxANumber = typeof this[_max] === 'number'
      const isMinANumber = typeof this[_min] === 'number'
      errors.push(checkPropertyValueIsANumber(this[_max], 'maximum required value'))
      errors.push(checkPropertyValueIsANumber(this[_min], 'minimum required value'))
      errors.push(checkPropertyValueIsANumber(this[_divisibleBy], 'divisor value'))
      if (isMaxANumber && isMinANumber && this[_max] < this[_min]) {
        errors.push(`required minimum value = ${this[_min]} is greater than required maximum = ${this[_max]}`)
      }
      const filteredErrors = errors.filter(error => error.length > 0)
      return filteredErrors
    },

    validate (value) {
      switch (true) {
        case value === null:
          return this[_optional] ? {} : { error: `value = null is not a number` }
        case value === undefined:
          return this[_optional] ? {} : { error: `value = undefined is not a number` }
        case typeof value !== 'number':
          return { error: `value of type ${typeof value} is not a number` }
        case isNaN(value):
          return { error: `value is NaN, "not a number"` }
        case this[_max] < value:
          return { error: `number = ${value} is bigger than required maximum = ${this[_max]}` }
        case this[_min] > value:
          return { error: `number = ${value} is smaller than required minimum = ${this[_min]}` }
        case this[_divisibleBy] > 0 && value % this[_divisibleBy] !== 0:
          return { error: `number = ${value} is not divisible by = ${this[_divisibleBy]}` }
        default: return {}
      }
    },

    checkSubsetOf (targetSchema) {
      switch (true) {
        case !isDivisibleSubset(this, targetSchema):
          return { isSubset: false, reason: `source division check value = ${this[_divisibleBy]} is not divisible by target value = ${targetSchema[_divisibleBy]}` }
        case this[_max] > targetSchema[_max]:
          return { isSubset: false, reason: `target maximum value = ${targetSchema[_max]} is smaller than source value = ${this[_max]}` }
        case this[_min] < targetSchema[_min]:
          return { isSubset: false, reason: `target minimum value = ${targetSchema[_min]} is bigger than source value = ${this[_min]}` }
        default:
          return { isSubset: true }
      }
    },

    * generateSequentialData (options) {
      const maxAmount = options.maxAmount
      const step = this[_divisibleBy] === 0 ? 0.1 : this[_divisibleBy]
      const baseStartingPoint = -maxAmount * step / 2.0
      const baseEndingPoint = maxAmount * step / 2.0
      const startingPoint = this[_min] === -Infinity ? baseStartingPoint : Math.max(this[_min], baseStartingPoint)
      const endingPoint = this[_max] === Infinity ? baseEndingPoint : Math.min(this[_max], baseEndingPoint)

      var value = baseStartingPoint
      for (let i = 0; value < endingPoint; ++i) {
        value = (startingPoint + i * step)
        yield value
      }
    },

    * generateRandomData (options) {
      const maxAmount = options.maxAmount
      const min = this[_min] === -Infinity ? Number.MIN_SAFE_INTEGER : this[_min]
      const max = this[_max] === Infinity ? Number.MAX_SAFE_INTEGER : this[_max]
      const diff = max - min
      const step = this[_divisibleBy]

      if (step === 0) {
        for (let i = 0; i < maxAmount; ++i) {
          yield Math.random() * diff + min
        }
      } else {
        for (let i = 0; i < maxAmount; ++i) {
          const randomNum = Math.random() * diff + min
          yield randomNum - (randomNum % step)
        }
      }
    }
  }
}

function checkPropertyValueIsANumber (value, propertyDescription) {
  switch (true) {
    case value === null:
      return `${propertyDescription} is null`
    case value === undefined:
      return `${propertyDescription} is undefined`
    case typeof value !== 'number':
      return `${propertyDescription} of type "${typeof value}" is not a number`
    default:
      return ''
  }
}

function isDivisibleSubset (sourceSchema, targetSchema) {
  switch (true) {
    case sourceSchema[_divisibleBy] === 0: return targetSchema[_divisibleBy] === 0
    case targetSchema[_divisibleBy] === 0: return true
    default: return sourceSchema[_divisibleBy] % targetSchema[_divisibleBy] === 0
  }
}

const applyFeaturesOn = (factory, features) => features.forEach(feature => feature.mixWith(factory))
applyFeaturesOn(NumberSchemaMaker, [OptionalValueFeature, GeneratorOptionCleanFeature, SchemaInstanceValidationFeature, SchemaValidationResultCacheFeature, BaseSubsetValidationFeature])
module.exports = NumberSchemaMaker.buildSchema(initialValues)
