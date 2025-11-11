import { stripPrefixFromEntityName } from '@hass/common/entity/strip_prefix_from_entity_name';
import { expect } from 'chai';

describe('strip_prefix_from_entity_name.ts', () => {
  it('should strip prefix with space suffix', () => {
    expect(
      stripPrefixFromEntityName('Living Room Light', 'Living Room'),
    ).to.equal('Light');
    expect(
      stripPrefixFromEntityName('Kitchen Temperature Sensor', 'Kitchen'),
    ).to.equal('Temperature Sensor');
  });

  it('should strip prefix with colon and space suffix', () => {
    expect(
      stripPrefixFromEntityName('Living Room: Light', 'Living Room'),
    ).to.equal('Light');
    expect(
      stripPrefixFromEntityName('Kitchen: Temperature Sensor', 'Kitchen'),
    ).to.equal('Temperature Sensor');
  });

  it('should strip prefix with dash and space suffix', () => {
    expect(
      stripPrefixFromEntityName('Living Room - Light', 'Living Room'),
    ).to.equal('- Light');
    expect(
      stripPrefixFromEntityName('Kitchen - Temperature Sensor', 'Kitchen'),
    ).to.equal('- Temperature Sensor');
  });

  it('should handle case insensitive matching', () => {
    expect(
      stripPrefixFromEntityName('LIVING ROOM Light', 'living room'),
    ).to.equal('Light');
    expect(
      stripPrefixFromEntityName('Kitchen TEMPERATURE Sensor', 'KITCHEN'),
    ).to.equal('TEMPERATURE Sensor');
  });

  it('should capitalize first word when appropriate', () => {
    expect(
      stripPrefixFromEntityName('living room light', 'living room'),
    ).to.equal('Light');
    expect(
      stripPrefixFromEntityName('kitchen temperature sensor', 'kitchen'),
    ).to.equal('Temperature sensor');
    // Test case where result is a single word (no space in result)
    expect(
      stripPrefixFromEntityName('living room lamp', 'living room'),
    ).to.equal('Lamp');
  });

  it('should preserve existing capitalization in first word', () => {
    expect(
      stripPrefixFromEntityName('Living Room iPhone', 'Living Room'),
    ).to.equal('IPhone');
    expect(
      stripPrefixFromEntityName('Kitchen Nest Thermostat', 'Kitchen'),
    ).to.equal('Nest Thermostat');
  });

  it('should return undefined when prefix does not match', () => {
    expect(stripPrefixFromEntityName('Living Room Light', 'Bedroom')).to.be
      .undefined;
    expect(stripPrefixFromEntityName('Kitchen Sensor', 'Bathroom')).to.be
      .undefined;
  });

  it('should return undefined when prefix matches but no suffix', () => {
    expect(stripPrefixFromEntityName('LivingRoom Light', 'Living')).to.be
      .undefined;
    expect(stripPrefixFromEntityName('KitchenSensor', 'Kitchen')).to.be
      .undefined;
  });

  it('should return undefined when result would be empty', () => {
    expect(stripPrefixFromEntityName('Living Room ', 'Living Room')).to.be
      .undefined;
    expect(stripPrefixFromEntityName('Kitchen: ', 'Kitchen')).to.be.undefined;
  });
});
