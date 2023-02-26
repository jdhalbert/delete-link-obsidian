import { Editor, Plugin } from 'obsidian'
import * as obsidian from 'obsidian'

export default class LinkDeletePlugin extends Plugin {
    
    async onload() {
		await this.load()
        console.log("Loading link-delete plugin")
        const replaceLinkWithNoteFunc = this.replaceLinkWithNote

        // This adds a settings tab so the user can configure various aspects of the plugin
        //this.addSettingTab(new SampleSettingTab(this.app, this))

        this.addCommand({
            id: "delete-link",
            name: "Delete link to block",
            // change the callback here?
            //callback: function (editor:Editor) { return this.replaceLinkWithNote(editor) }
            editorCallback: function (editor: Editor, ctx) { return replaceLinkWithNoteFunc(editor) },
            hotkeys: [
                {
                    modifiers: ["Mod"],
                    key: "m",
                },
            ],
        })
	}

    onunload(): void {
        console.log("Unloading link-delete plugin")
	}

    replaceLinkWithNote(editor:Editor) {
        //const editor = this.app.workspace.activeEditor.editor
        console.log('Delete-link called')

        // Find the cursor
        const currentCursor:obsidian.EditorPosition = editor.getCursor()

        // Get the whole line that the cursor is on
        const currentLine = editor.getLine(currentCursor.line)

        // Find the last instance of '[[' behind the cursor
        const from:obsidian.EditorPosition = {
            line: currentCursor.line,
            ch: currentLine.substring(0, currentCursor.ch).lastIndexOf('[[')
        }
        
        // Find the first instance of ']]' after the the opening brackets
        const to:obsidian.EditorPosition = {
            line: currentCursor.line,
            ch: currentLine.indexOf(']]', from.ch) + 2
        }

        // Do nothing if a full link is not found
        if(!from || !to) return

        // Search the full link text for only the text after the pipe and before the ']]'
        const fullLink = editor.getRange(from, to)
        const noteSearcher = new RegExp(/(?<=\|).+(?=]])/)
        const noteTextArray = noteSearcher.exec(fullLink)

        // Do nothing if the search returns nothing
        if(!noteTextArray) return
        const noteText = noteTextArray.first()
        if(!noteText) return
        
        // Replace the link with the found note text
        console.log('Replacing full link ' + fullLink + ' with ' + noteText)
        editor.replaceRange(noteText, from, to)
    }
}