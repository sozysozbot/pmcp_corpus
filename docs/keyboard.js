function insertAtCursor(inputElement, textToInsert) {
  // Get the current text of the input element
  const currentValue = inputElement.value;

  // Get the start and end positions of the cursor
  const start = inputElement.selectionStart;
  const end = inputElement.selectionEnd;

  // Insert the text at the cursor position
  inputElement.value = currentValue.slice(0, start) + textToInsert + currentValue.slice(end);

  // Move the cursor after the inserted text
  inputElement.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
}
