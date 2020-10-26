import Command from '@ckeditor/ckeditor5-core/src/command';

export default class FastBtnCommand extends Command {

    constructor(editor, commands, view) {
        super(editor);
        this.commands = !!commands && typeof commands === 'object' ? commands : {};
        this.view = view;
    }

    execute(message) {
        if (!!this.commands.execute && typeof this.commands.execute === 'function') {
            this.commands.execute(this.view, this.editor, message);
        }
    }

    refresh() {
        if (!!this.commands.refresh && typeof this.commands.refresh === 'function') {
            this.commands.refresh(this.view, this.editor);
        }
    }

}
