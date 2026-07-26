import type { HomeAssistant } from '@homeassistant-extras/hass/types';
import {
  getEntityHuiImageConfig,
  getHuiImageConfig,
} from '@theme/image/background-to-hui-config';
import type { Config } from '@type/config';
import { expect } from 'chai';

describe('background-to-hui-config.ts', () => {
  let mockHass: HomeAssistant;

  beforeEach(() => {
    mockHass = {
      states: {
        'image.doorbell': {
          entity_id: 'image.doorbell',
          state: '2024-01-01T00:00:00+00:00',
          attributes: {
            entity_picture: '/api/image_proxy/image.doorbell?token=abc',
          },
        },
        'person.gina': {
          entity_id: 'person.gina',
          state: 'home',
          attributes: {
            entity_picture: '/api/image/serve/gina/512x512',
          },
        },
        'sensor.no_picture': {
          entity_id: 'sensor.no_picture',
          state: '42',
          attributes: {},
        },
      },
      areas: {
        living_room: {
          area_id: 'living_room',
          name: 'Living Room',
          picture: '/local/living_room.png',
        },
        bedroom: { area_id: 'bedroom', name: 'Bedroom', picture: null },
      },
    } as any as HomeAssistant;
  });

  describe('getHuiImageConfig', () => {
    it('should return undefined when backgrounds are disabled', () => {
      const config: Config = {
        area: 'living_room',
        background: { image: '/local/bg.jpg', options: ['disable'] },
      };
      expect(getHuiImageConfig(mockHass, config)).to.be.undefined;
    });

    it('should map a camera image_entity to camera_image with auto view', () => {
      const config: Config = {
        area: 'bedroom',
        background: { image_entity: 'camera.front_door' },
      };
      expect(getHuiImageConfig(mockHass, config)).to.deep.equal({
        camera_image: 'camera.front_door',
        camera_view: 'auto',
      });
    });

    it('should map an image entity to its entity_picture', () => {
      const config: Config = {
        area: 'bedroom',
        background: { image_entity: 'image.doorbell' },
      };
      expect(getHuiImageConfig(mockHass, config)).to.deep.equal({
        image: '/api/image_proxy/image.doorbell?token=abc',
      });
    });

    it('should map a person entity to its entity_picture', () => {
      const config: Config = {
        area: 'bedroom',
        background: { image_entity: 'person.gina' },
      };
      expect(getHuiImageConfig(mockHass, config)).to.deep.equal({
        image: '/api/image/serve/gina/512x512',
      });
    });

    it('should prioritize image_entity over background.image', () => {
      const config: Config = {
        area: 'living_room',
        background: {
          image_entity: 'person.gina',
          image: '/local/bg.jpg',
        },
      };
      expect(getHuiImageConfig(mockHass, config)).to.deep.equal({
        image: '/api/image/serve/gina/512x512',
      });
    });

    it('should fall through to background.image when image_entity has no picture', () => {
      const config: Config = {
        area: 'bedroom',
        background: {
          image_entity: 'sensor.no_picture',
          image: '/local/bg.jpg',
        },
      };
      expect(getHuiImageConfig(mockHass, config)).to.deep.equal({
        image: '/local/bg.jpg',
      });
    });

    it('should map a string background.image directly', () => {
      const config: Config = {
        area: 'bedroom',
        background: { image: 'https://example.com/bg.jpg' },
      };
      expect(getHuiImageConfig(mockHass, config)).to.deep.equal({
        image: 'https://example.com/bg.jpg',
      });
    });

    it('should map a media source object to its media_content_id', () => {
      const config: Config = {
        area: 'bedroom',
        background: {
          image: {
            media_content_id: 'media-source://media_source/local/bg.jpg',
            media_content_type: 'image/jpeg',
          },
        },
      };
      expect(getHuiImageConfig(mockHass, config)).to.deep.equal({
        image: 'media-source://media_source/local/bg.jpg',
      });
    });

    it('should fall back to the area picture', () => {
      const config: Config = { area: 'living_room' };
      expect(getHuiImageConfig(mockHass, config)).to.deep.equal({
        image: '/local/living_room.png',
      });
    });

    it('should return undefined when the area has no picture', () => {
      const config: Config = { area: 'bedroom' };
      expect(getHuiImageConfig(mockHass, config)).to.be.undefined;
    });

    it('should return undefined for an unknown area', () => {
      const config: Config = { area: 'garage' };
      expect(getHuiImageConfig(mockHass, config)).to.be.undefined;
    });
  });

  describe('getEntityHuiImageConfig', () => {
    const entity = (
      entityId: string,
      attributes: Record<string, unknown>,
      features: string[] = [],
    ) =>
      ({
        config: { entity_id: entityId, features },
        state: {
          entity_id: entityId,
          state: 'on',
          attributes,
          domain: entityId.split('.')[0],
        },
      }) as any;

    it('should map a camera entity to camera_image so the icon refreshes', () => {
      // An entity_picture snapshot URL resolves once and never updates;
      // camera_image gets hui-image's thumbnail polling instead.
      expect(
        getEntityHuiImageConfig(
          entity('camera.patio', {
            entity_picture: '/api/camera_proxy/camera.patio?token=abc',
          }),
        ),
      ).to.deep.equal({ camera_image: 'camera.patio', camera_view: 'auto' });
    });

    it('should map a non-camera entity to its entity picture', () => {
      expect(
        getEntityHuiImageConfig(
          entity('person.gina', {
            entity_picture: '/api/image/serve/gina/512x512',
          }),
        ),
      ).to.deep.equal({ image: '/api/image/serve/gina/512x512' });
    });

    it('should map media player art to its entity picture', () => {
      expect(
        getEntityHuiImageConfig(
          entity('media_player.den', { entity_picture: '/api/media/art.png' }),
        ),
      ).to.deep.equal({ image: '/api/media/art.png' });
    });

    it('should return undefined without an entity picture', () => {
      expect(getEntityHuiImageConfig(entity('light.lamp', {}))).to.be.undefined;
    });

    it('should return undefined for a camera opted out via use_entity_icon', () => {
      expect(
        getEntityHuiImageConfig(
          entity(
            'camera.patio',
            { entity_picture: '/api/camera_proxy/camera.patio' },
            ['use_entity_icon'],
          ),
        ),
      ).to.be.undefined;
    });

    it('should return undefined without an entity', () => {
      expect(getEntityHuiImageConfig(undefined)).to.be.undefined;
    });
  });
});
