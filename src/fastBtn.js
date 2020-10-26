import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import FastBtnCommand from './fastBtnCommand';

/**
 * The FastBtn feature. A simple way to edit and add buttons in the editor toolbar.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FastBtn extends Plugin {

    /**
     * @inheritDoc
     */
    init() {
        const options = this.editor.config.get('fastBtn');
        if (!options) {
            return;
        }

        for (const option of options) {
            const name = this.getValue(option, 'name');
            const replace = this.getValue(option, 'replace');
            if (!replace) {
                this.addBtn(name, option);
            } else {
                this.replaceBtn(name, option);
            }
        }
    }

    getConfig(option) {
        const config = {};
        for (const type in option) {
            if (type === 'name') {
                continue;
            }
            const value = this.getValue(option, type);
            if (typeof value === 'boolean' || !!value) {
                config[ type ] = value;
            }
        }

        return config;
    }

    getValue(option, name, valueDefault = null) {
        let result = typeof option[ name ] === 'boolean' || !!option[ name ] ? option[ name ] : valueDefault;
        const noCall = name !== 'refresh' && name !== 'execute' && name !== 'mounted' && name !== 'created' && name !== 'action';
        result = noCall && typeof result === 'function' ? result(this.editor) : result;
        return result;
    }

    addBtn(name, option) {
        const editor = this.editor;
        name = 'fastBtn:' + name;
        editor.ui.componentFactory.add(name, locale => {
            const action = this.getValue(option, 'action');
            const refresh = this.getValue(option, 'refresh');
            const config = this.getConfig(option);
            const view = new ButtonView(locale);
            view.set(config);
            editor.commands.add(name, new FastBtnCommand(editor, {
                execute: action,
                refresh,
            }, view));

            const created = this.getValue(option, 'created');
            const mounted = this.getValue(option, 'mounted');

            view.render();

            if (created) {
                created(view, editor, config);
            }

            const actionFunc = () => {
                action(view, editor, config);
            };
            view.on('execute', actionFunc);
            editor.keystrokes.set(config.keystroke, actionFunc);

            if (mounted) {
                mounted(view, editor, config);
            }

            return view;
        });
    }

    replaceBtn(name, option) {
        const created = this.getValue(option, 'created');
        const mounted = this.getValue(option, 'mounted');
        const plugin = this.getValue(option, 'plugin');

        if (plugin === 'BlockToolbar' && name === '+') {
            this.replaceMainBlockBtn(option);
            return;
        }
        const editor = this.editor;
        editor.on('ready', () => {
            const itemsToolbar = this.getItemsToolbar(plugin);
            const configToolbar = this.getConfigToolbar(plugin);
            const config = this.getConfig(option);

            for (const index in configToolbar) {
                const value = configToolbar[ index ];
                if (value === name && !!itemsToolbar[ index ]) {
                    const view = itemsToolbar[ index ];
                    if (created) {
                        created(view, editor, config);
                    }
                    Object.assign(view, config);
                    if (mounted) {
                        mounted(view, editor, config);
                    }
                }
            }
        });
    }

    getConfigToolbar(plugin = null) {
        const editor = this.editor;
        let name = 'toolbar';
        if (plugin === 'BlockToolbar') {
            name = 'blockToolbar';
        } else if (plugin === 'BalloonToolbar') {
            name = 'balloonToolbar';
        }
        const config = editor.config.get(name);
        return typeof config === 'object' && !!config.items ? config.items : config;
    }

    getItemsToolbar(plugin = null) {
        const editor = this.editor;
        let toolbar = editor.ui.view.toolbar;
        if (plugin === 'BlockToolbar') {
            toolbar = editor.plugins.get('BlockToolbar').toolbarView;
        } else if (plugin === 'BalloonToolbar') {
            toolbar = editor.plugins.get('BalloonToolbar').toolbarView;
        }
        return toolbar.items._items;
    }

    replaceMainBlockBtn(option) {
        const editor = this.editor;
        const view = editor.plugins.get('BlockToolbar').buttonView;

        const created = this.getValue(option, 'created');
        const mounted = this.getValue(option, 'mounted');
        const config = this.getConfig(option);

        if (created) {
            created(view, editor, config);
        }
        Object.assign(view, config);
        if (mounted) {
            mounted(view, editor, config);
        }
    }

    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'FastBtn';
    }

}
