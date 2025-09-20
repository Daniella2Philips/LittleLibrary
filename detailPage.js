/**
 * Little Library - Book Detail Page JavaScript
 * This file handles the book detail page functionality
 * 
 * Features:
 * - Display book information
 * - Update book status
 * - Delete books
 * - Handle cover images with fallbacks
 */

/**
 * Updates the reading status of the current book
 * Gets the new status from the dropdown and saves it
 */
async function updateStatus() {
    const bookId = getBookIdFromUrl(); // From library.js
    const newStatus = document.getElementById('statusSelect').value;
    
    console.log('Updating status for book ID:', bookId, 'to:', newStatus);
    
    // Make sure we have a book ID
    if (!bookId) {
        alert('No book selected');
        return;
    }

    try {
        // Load all books from server
        const books = await loadBooks();
        console.log('Loaded books for status update:', books);
        
        // Find the book we want to update
        const bookIndex = books.findIndex(b => b.id == bookId);
        console.log('Found book at index:', bookIndex);

        if (bookIndex === -1) {
            alert('Book not found');
            return;
        }

        // Update the book's status
        const oldStatus = books[bookIndex].status;
        books[bookIndex].status = newStatus;
        
        console.log('Updated book status from', oldStatus, 'to', books[bookIndex].status);
        console.log('Updated book object:', books[bookIndex]);
        
        // Save the updated books list
        const success = await saveBooks(books);
        
        if (success) {
            alert('Status updated to: ' + newStatus);
            console.log('Status successfully saved to JSON');
        } else {
            alert('Error updating status. Please try again.');
        }
        
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status. Please try again.');
    }
}

/**
 * Deletes the current book from the library
 * Shows confirmation dialog before deleting
 */
async function deleteBook() {
    const bookId = getBookIdFromUrl(); // From library.js
    
    if (!bookId) {
        alert('No book selected');
        return;
    }

    try {
        // Load all books
        const books = await loadBooks();
        const book = books.find(b => b.id == bookId);

        if (!book) {
            alert('Book not found');
            return;
        }

        // Ask user to confirm deletion
        const confirmDelete = confirm(
            'Are you sure you want to delete "' + book.title + '"? This action cannot be undone.'
        );
        
        if (confirmDelete) {
            // Remove the book from the array
            const updatedBooks = books.filter(b => b.id != bookId);
            
            // Save the updated list
            const success = await saveBooks(updatedBooks);
            
            if (success) {
                alert('"' + book.title + '" has been deleted from your library.');
                window.location.href = 'index.html'; // Go back to main page
            } else {
                alert('Error deleting book. Please try again.');
            }
        }
        
    } catch (error) {
        console.error('Error deleting book:', error);
        alert('Error deleting book. Please try again.');
    }
}

/**
 * Displays all the book information on the page
 * This is the main function that sets up the detail view
 */
async function displayBookDetails() {
    const bookId = getBookIdFromUrl(); // From library.js
    
    // Make sure we have a book ID from the URL
    if (!bookId) {
        alert('No book selected');
        window.location.href = 'index.html';
        return;
    }

    try {
        // Load books and find the one we want
        const books = await loadBooks();
        const book = books.find(b => b.id == bookId);

        if (!book) {
            alert('Book not found');
            window.location.href = 'index.html';
            return;
        }

        console.log('Displaying details for book:', book);

        // Update the page title
        document.title = book.title + ' - Little Library';

        // Display basic book information
        document.getElementById('bookTitle').textContent = book.title || 'Untitled';
        document.getElementById('bookAuthor').textContent = 'by ' + (book.author || 'Unknown Author');

        // Handle the cover image
        setupCoverImage(book);

        // Handle optional fields (only show if they have content)
        setupOptionalFields(book);

        // Set up the status dropdown
        setupStatusDropdown(book);

        // Display when the book was added
        if (book.dateAdded) {
            document.getElementById('dateAdded').textContent = 
                new Date(book.dateAdded).toLocaleDateString();
        }
        
    } catch (error) {
        console.error('Error displaying book details:', error);
        alert('Error loading book details');
        window.location.href = 'index.html';
    }
}

/**
 * Sets up the cover image with fallback handling
 * Parameter: book - the book object
 */
function setupCoverImage(book) {
    const coverImg = document.getElementById('bookCover');
    const noCover = document.getElementById('noCover');
    
    if (book.coverImage && book.coverImage.trim()) {
        // Book has a cover image URL
        coverImg.src = book.coverImage;
        
        // If image loads successfully, show it
        coverImg.onload = function() {
            coverImg.style.display = 'block';
            noCover.style.display = 'none';
        };
        
        // If image fails to load, show fallback
        coverImg.onerror = function() {
            coverImg.style.display = 'none';
            noCover.style.display = 'block';
        };
    } else {
        // No cover image URL provided
        coverImg.style.display = 'none';
        noCover.style.display = 'block';
    }
}

/**
 * Sets up the optional fields (description, review, tags)
 * Only shows sections that have content
 * Parameter: book - the book object
 */
function setupOptionalFields(book) {
    // Handle description
    if (book.description && book.description.trim()) {
        document.getElementById('bookDescription').textContent = book.description;
        document.getElementById('descriptionRow').style.display = 'table-row';
        document.getElementById('descriptionContentRow').style.display = 'table-row';
    }

    // Handle review
    if (book.review && book.review.trim()) {
        document.getElementById('bookReview').textContent = book.review;
        document.getElementById('reviewRow').style.display = 'table-row';
        document.getElementById('reviewContentRow').style.display = 'table-row';
    }

    // Handle tags
    if (book.tags && book.tags.length > 0) {
        // Create styled tag elements
        const tagsHtml = book.tags.map(tag => 
            '<span style="background: #f0f0f0; padding: 2px 6px; margin: 2px; border-radius: 3px;">[' + 
            tag + ']</span>'
        ).join(' ');
        
        document.getElementById('bookTags').innerHTML = tagsHtml;
        document.getElementById('tagsRow').style.display = 'table-row';
        document.getElementById('tagsContentRow').style.display = 'table-row';
    }
}

/**
 * Sets up the status dropdown with the current book's status
 * Parameter: book - the book object
 */
function setupStatusDropdown(book) {
    const statusSelect = document.getElementById('statusSelect');
    
    if (book.status) {
        // Set dropdown to book's current status
        statusSelect.value = book.status;
    } else {
        // Default to "want to read" if no status is set
        statusSelect.value = 'want to read';
    }
}

/**
 * Page initialization
 * This runs when the page finishes loading
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Detail page loaded, displaying book details...');
    displayBookDetails();
});