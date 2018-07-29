import { System } from '../../third_party';
import BaseEvent from '../BaseEvent';
import UI from '../../ui/UI';

/**
 * 场景面板事件
 * @param {*} app 
 */
function ScenePanelEvent(app) {
    BaseEvent.call(this, app);
    this.ignoreObjectSelectedSignal = false;
}

ScenePanelEvent.prototype = Object.create(BaseEvent.prototype);
ScenePanelEvent.prototype.constructor = ScenePanelEvent;

ScenePanelEvent.prototype.start = function () {
    this.app.on(`updateScenePanelFog.${this.id}`, this.refreshFogUI.bind(this));
    this.app.on(`editorCleared.${this.id}`, this.refreshUI.bind(this));
    this.app.on(`sceneGraphChanged.${this.id}`, this.refreshUI.bind(this));
    this.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
    this.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
    this.app.on(`outlinerChange.${this.id}`, this.onOutlinerChange.bind(this));
    this.refreshUI();
};

ScenePanelEvent.prototype.stop = function () {
    this.app.on(`updateScenePanelFog.${this.id}`, null);
    this.app.on(`editorCleared.${this.id}`, null);
    this.app.on(`sceneGraphChanged.${this.id}`, null);
    this.app.on(`objectChanged.${this.id}`, null);
    this.app.on(`objectSelected.${this.id}`, null);
    this.app.on(`outlinerChange.${this.id}`, null);
};

ScenePanelEvent.prototype.onOutlinerChange = function (control) {
    var editor = this.app.editor;

    this.ignoreObjectSelectedSignal = true;
    editor.selectById(parseInt(control.getValue()));
    this.ignoreObjectSelectedSignal = false;
};

/**
 * 场景物体改变
 * @param {*} object 
 */
ScenePanelEvent.prototype.onObjectChanged = function (object) {
    var outliner = UI.get('outliner');

    var options = outliner.options;

    for (var i = 0; i < options.length; i++) {
        var option = options[i];

        if (option.value === object.id) {
            option.innerHTML = this.buildHTML(object);
            return;
        }
    }
};

/**
 * 选中物体改变
 * @param {*} object 
 */
ScenePanelEvent.prototype.onObjectSelected = function (object) {
    var outliner = UI.get('outliner');

    if (this.ignoreObjectSelectedSignal === true) {
        return;
    }

    outliner.setValue(object !== null ? object.id : null);
};

// outliner
ScenePanelEvent.prototype.buildOption = function (object, draggable) {
    var option = document.createElement('div');
    option.draggable = draggable;
    option.innerHTML = this.buildHTML(object);
    option.value = object.id;
    return option;
};

ScenePanelEvent.prototype.buildHTML = function (object) {
    var html = '<span class="type ' + object.type + '"></span> ' + object.name;

    if (object instanceof THREE.Mesh) {
        var geometry = object.geometry;
        var material = object.material;

        html += ' <span class="type ' + geometry.type + '"></span> ' + geometry.name;
        html += ' <span class="type ' + material.type + '"></span> ' + (material.name == null ? '' : material.name);
    }

    html += this.getScript(object.uuid);
    return html;
};

ScenePanelEvent.prototype.getScript = function (uuid) {
    var editor = this.app.editor;

    if (editor.scripts[uuid] !== undefined) {
        return ' <span class="type Script"></span>';
    }

    return '';
};

ScenePanelEvent.prototype.refreshUI = function () {
    var editor = this.app.editor;
    var camera = editor.camera;
    var scene = editor.scene;
    var outliner = UI.get('outliner');
    var backgroundColor = UI.get('backgroundColor');
    var fogColor = UI.get('fogColor');
    var fogType = UI.get('fogType');
    var fogNear = UI.get('fogNear');
    var fogFar = UI.get('fogFar');
    var fogDensity = UI.get('fogDensity');

    var options = [];

    options.push(this.buildOption(camera, false));
    options.push(this.buildOption(scene, false));

    var _this = this;

    (function addObjects(objects, pad) {
        for (var i = 0, l = objects.length; i < l; i++) {
            var object = objects[i];

            var option = _this.buildOption(object, true);
            option.style.paddingLeft = (pad * 10) + 'px';
            options.push(option);

            addObjects(object.children, pad + 1);
        }
    })(scene.children, 1);

    outliner.setOptions(options);

    if (editor.selected !== null) {
        outliner.setValue(editor.selected.id);
    }

    if (scene.background) {
        backgroundColor.setHexValue(scene.background.getHex());
    }

    if (scene.fog) {
        fogColor.setHexValue(scene.fog.color.getHex());

        if (scene.fog instanceof THREE.Fog) {
            fogType.setValue("Fog");
            fogNear.setValue(scene.fog.near);
            fogFar.setValue(scene.fog.far);
        } else if (scene.fog instanceof THREE.FogExp2) {
            fogType.setValue("FogExp2");
            fogDensity.setValue(scene.fog.density);
        }
    } else {
        fogType.setValue("None");
    }

    this.refreshFogUI();
};

ScenePanelEvent.prototype.refreshFogUI = function () {
    var fogType = UI.get('fogType');
    var fogPropertiesRow = UI.get('fogPropertiesRow');
    var fogNear = UI.get('fogNear');
    var fogFar = UI.get('fogFar');
    var fogDensity = UI.get('fogDensity');

    var type = fogType.getValue();

    fogPropertiesRow.dom.style.display = type === 'None' ? 'none' : '';
    fogNear.dom.style.display = type === 'Fog' ? '' : 'none';
    fogFar.dom.style.display = type === 'Fog' ? '' : 'none';
    fogDensity.dom.style.display = type === 'FogExp2' ? '' : 'none';
}

export default ScenePanelEvent;