import { computeDeviceName } from '@hass/common/entity/compute_device_name';
import { expect } from 'chai';

describe('compute_device_name.ts', () => {
  it('should return name_by_user when available', () => {
    const device = {
      name_by_user: 'My Living Room Device',
      name: 'Living Room Device',
    } as any;

    expect(computeDeviceName(device)).to.equal('My Living Room Device');
  });

  it('should fall back to name when name_by_user is not available', () => {
    const device = {
      name: 'Kitchen Device',
    } as any;

    expect(computeDeviceName(device)).to.equal('Kitchen Device');
  });

  it('should return undefined when neither name is available', () => {
    const device = {} as any;
    expect(computeDeviceName(device)).to.be.undefined;

    const device2 = { name: undefined, name_by_user: undefined } as any;
    expect(computeDeviceName(device2)).to.be.undefined;
  });

  it('should trim whitespace from names', () => {
    const device = {
      name_by_user: '  Living Room Device  ',
      name: 'Kitchen Device',
    } as any;

    expect(computeDeviceName(device)).to.equal('Living Room Device');
  });

  it('should handle empty string names', () => {
    const device = {
      name_by_user: '',
      name: 'Kitchen Device',
    } as any;

    expect(computeDeviceName(device)).to.equal('');

    const device2 = {
      name_by_user: '   ',
      name: 'Living Room Device',
    } as any;

    expect(computeDeviceName(device2)).to.equal('');
  });

  it('should prioritize name_by_user over name', () => {
    const device = {
      name_by_user: 'Custom Name',
      name: 'Default Name',
    } as any;

    expect(computeDeviceName(device)).to.equal('Custom Name');
  });
});
