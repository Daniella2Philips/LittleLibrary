/**
 * Little Library - Add Book Page JavaScript
 * This file handles the add book form functionality
 * 
 * Features:
 * - Process form submission
 * - Validate book data
 * - Save new book to server
 * - Redirect back to main library
 */

/**
 * Handles the form submission when user adds a new book
 * Parameter: event - the form submit event
 */
async function handleAddBook(event) {
    // Prevent the form from submitting the traditional way
    event.preventDefault();
    console.log('Add book form submitted');
    
    const form = event.target;
    const formData = new FormData(form); // Extract all form field values
    
    // Create a book object with all the form data
    const book = {
        id: Date.now(), // Use current timestamp as unique ID
        title: formData.get('title').trim(),
        author: formData.get('author').trim(),
        description: formData.get('description').trim(),
        coverImage: formData.get('coverImage').trim(),
        review: formData.get('review').trim(),
        
        // Split tags by comma and clean up each tag
        tags: formData.get('tags')
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag), // Remove empty tags
            
        status: formData.get('status'), // Reading status from dropdown
        dateAdded: new Date().toISOString() // Current date/time
    };

    console.log('New book data:', book);

    // Validate that title is provided (required field)
    if (!book.title) {
        alert('Please enter a book title');
        document.getElementById('title').focus(); // Put cursor back in title field
        return;
    }

    try {
        // Load existing books from server
        const existingBooks = await loadBooks();
        console.log('Current books in library:', existingBooks);
        
        // Add the new book to the list
        existingBooks.push(book);
        console.log('Books after adding new one:', existingBooks);
        
        // Save the updated list back to server
        const success = await saveBooks(existingBooks);
        
        if (success) {
            // Success! Show confirmation and redirect
            alert('"' + book.title + '" has been added to your library!');
            form.reset(); // Clear the form
            window.location.href = 'index.html'; // Go back to main page
        } else {
            // Something went wrong with saving
            alert('Error saving book. Please try again.');
        }
        
    } catch (error) {
        console.error('Error in handleAddBook:', error);
        alert('Error adding book. Please try again.');
    }
}

/**
 * Page initialization
 * This runs when the page finishes loading
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Add book page loaded');
    
    // Find the form and set up the submit handler
    const form = document.getElementById('addBookForm');
    if (form) {
        form.addEventListener('submit', handleAddBook);
        console.log('Form submit handler attached');
    } else {
        console.error('Could not find add book form!');
    }
    
    // Focus on the title field for better user experience
    const titleField = document.getElementById('title');
    if (titleField) {
        titleField.focus();
    }
});