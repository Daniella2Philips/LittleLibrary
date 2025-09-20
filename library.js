/**
 * Little Library - Shared JavaScript Functions
 * This file contains functions that are used across multiple pages
 * 
 * Functions in this file:
 * - loadBooks(): Gets books from the server
 * - saveBooks(): Saves books to the server
 * - getBookIdFromUrl(): Extracts book ID from page URL
 */

/**
 * Loads all books from the server
 * This function makes an API call to get the current list of books
 * Returns: Array of book objects
 */
async function loadBooks() {
    try {
        console.log('Loading books from server...');
        
        // Make a request to our server's /books endpoint
        const response = await fetch('/books');
        const data = await response.json();
        
        console.log('Raw data from server:', data);
        
        // Extract the books array from the response
        // If no books exist, return an empty array
        return data.books || [];
        
    } catch (error) {
        console.error('Error loading books:', error);
        return []; // Return empty array if something goes wrong
    }
}

/**
 * Saves books to the server
 * This function sends the updated book list to the server
 * Parameter: books - Array of book objects to save
 * Returns: true if successful, false if failed
 */
async function saveBooks(books) {
    try {
        console.log('Saving books to server...', books);
        
        // Create the data structure that our server expects
        const dataToSave = {
            library: "Little Library",
            lastUpdated: new Date().toISOString(), // Current date/time
            totalBooks: books.length,
            books: books
        };
        
        // Send POST request to server with the book data
        const response = await fetch('/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSave)
        });
        
        // Check if the save was successful
        return response.ok;
        
    } catch (error) {
        console.error('Error saving books:', error);
        return false;
    }
}

/**
 * Gets the book ID from the current page URL
 * Used on the detail page to know which book to display
 * For example: detailpage.html?id=123 returns "123"
 * Returns: The book ID as a string, or null if not found
 */
function getBookIdFromUrl() {
    // URLSearchParams helps us read URL parameters easily
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}