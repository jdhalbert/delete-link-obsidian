import { Editor, Plugin } from 'obsidian'
import * as obsidian from 'obsidian'

export default class LinkDeletePlugin extends Plugin {
    
    async onload() {
		await this.load()
        console.log("Loading link-delete plugin")

        // Must alias "this" for the editorCallback or it will raise "not a function" error
        const replaceLinkWithNoteFunc = this.replaceLinkWithNote

        // Register the function as a command with a default hotkey
        this.addCommand({
            id: "delete-link",
            name: "Remove link and replace with note portion only",
            editorCallback: function (editor: Editor) { return replaceLinkWithNoteFunc(editor) },
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

    replaceLinkWithNote(editor:Editor):void {
        console.log('link-delete called')

        // Find the cursor
        const currentCursor:obsidian.EditorPosition = editor.getCursor()

        // Get the whole line that the cursor is on
        const currentLine = editor.getLine(currentCursor.line)

        // Determine if the cursor is inside a link
        let inLink = true

        const lastOpenBrackets = currentLine.substring(0, currentCursor.ch + 1).lastIndexOf('[[')
        if(lastOpenBrackets == -1) inLink = false

        const nextClosedBrackets = currentLine.indexOf(']]', lastOpenBrackets)
        if(nextClosedBrackets == -1) inLink = false
        if(!(currentCursor.ch < nextClosedBrackets + 2)) inLink = false
        
        if(!inLink) {
            console.log('cursor not in link')
            return
        }

        // Find the last instance of '[[' behind the cursor
        const from:obsidian.EditorPosition = {
            line: currentCursor.line,
            ch: currentLine.substring(0, currentCursor.ch + 2).lastIndexOf('[[')
        }
        
        // Find the first instance of ']]' after the the cursor
        const to:obsidian.EditorPosition = {
            line: currentCursor.line,
            ch: currentLine.indexOf(']]', currentCursor.ch - 2) + 2
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