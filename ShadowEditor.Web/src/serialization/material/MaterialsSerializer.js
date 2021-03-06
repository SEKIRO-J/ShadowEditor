import BaseSerializer from '../BaseSerializer';

import LineBasicMaterialSerializer from './LineBasicMaterialSerializer';
import LineDashedMaterialSerializer from './LineDashedMaterialSerializer';
import MeshBasicMaterialSerializer from './MeshBasicMaterialSerializer';
import MeshDepthMaterialSerializer from './MeshDepthMaterialSerializer';
import MeshDistanceMaterialSerializer from './MeshDistanceMaterialSerializer';
import MeshFaceMaterialSerializer from './MeshFaceMaterialSerializer';
import MeshLambertMaterialSerializer from './MeshLambertMaterialSerializer';
import MeshNormalMaterialSerializer from './MeshNormalMaterialSerializer';
import MeshPhongMaterialSerializer from './MeshPhongMaterialSerializer';
import MeshPhysicalMaterialSerializer from './MeshPhysicalMaterialSerializer';
import MeshStandardMaterialSerializer from './MeshStandardMaterialSerializer';
import MeshToonMaterialSerializer from './MeshToonMaterialSerializer';
import MultiMaterialSerializer from './MultiMaterialSerializer';
import ParticleBasicMaterialSerializer from './ParticleBasicMaterialSerializer';
import ParticleSystemMaterialSerializer from './ParticleSystemMaterialSerializer';
import PointCloudMaterialSerializer from './PointCloudMaterialSerializer';
import PointsMaterialSerializer from './PointsMaterialSerializer';
import RawShaderMaterialSerializer from './RawShaderMaterialSerializer';
import ShaderMaterialSerializer from './ShaderMaterialSerializer';
import ShadowMaterialSerializer from './ShadowMaterialSerializer';
import SpriteCanvasMaterialSerializer from './SpriteCanvasMaterialSerializer';
import SpriteMaterialSerializer from './SpriteMaterialSerializer';

var Serializers = {
    'LineBasicMaterial': LineBasicMaterialSerializer,
    'LineDashedMaterial': LineDashedMaterialSerializer,
    'MeshBasicMaterial': MeshBasicMaterialSerializer,
    'MeshDepthMaterial': MeshDepthMaterialSerializer,
    'MeshDistanceMaterial': MeshDistanceMaterialSerializer,
    'MeshFaceMaterial': MeshFaceMaterialSerializer,
    'MeshLambertMaterial': MeshLambertMaterialSerializer,
    'MeshNormalMaterial': MeshNormalMaterialSerializer,
    'MeshPhongMaterial': MeshPhongMaterialSerializer,
    'MeshPhysicalMaterial': MeshPhysicalMaterialSerializer,
    'MeshStandardMaterial': MeshStandardMaterialSerializer,
    'MeshToonMaterial': MeshToonMaterialSerializer,
    'MultiMaterial': MultiMaterialSerializer,
    'ParticleBasicMaterial': ParticleBasicMaterialSerializer,
    'ParticleSystemMaterial': ParticleSystemMaterialSerializer,
    'PointCloudMaterial': PointCloudMaterialSerializer,
    'PointsMaterial': PointsMaterialSerializer,
    'RawShaderMaterial': RawShaderMaterialSerializer,
    'ShaderMaterial': ShaderMaterialSerializer,
    'ShadowMaterial': ShadowMaterialSerializer,
    'SpriteCanvasMaterial': SpriteCanvasMaterialSerializer,
    'SpriteMaterial': SpriteMaterialSerializer
};

/**
 * MaterialsSerializer
 * @author tengge / https://github.com/tengge1
 */
function MaterialsSerializer() {
    BaseSerializer.call(this);
}

MaterialsSerializer.prototype = Object.create(BaseSerializer.prototype);
MaterialsSerializer.prototype.constructor = MaterialsSerializer;

MaterialsSerializer.prototype.toJSON = function (obj) {
    var serializer = Serializers[obj.type];

    if (serializer === undefined) {
        console.warn(`MaterialsSerializer: No serializer with ${obj.type}.`);
        return null;
    }

    return (new serializer()).toJSON(obj);
};

MaterialsSerializer.prototype.fromJSON = function (json, parent, server) {
    var generator = json.metadata.generator;

    var serializer = Serializers[generator.replace('Serializer', '')];

    if (serializer === undefined) {
        console.warn(`MaterialsSerializer: No deserializer with ${generator}.`);
        return null;
    }

    return (new serializer()).fromJSON(json, parent, server);
};

export default MaterialsSerializer;