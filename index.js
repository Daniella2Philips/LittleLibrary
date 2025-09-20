/**
 * Little Library - Main Page JavaScript
 * This file handles the main library page functionality
 * 
 * Features:
 * - Display books in a visual bookshelf
 * - Search through books
 * - Navigate to book details
 * - Filter and show books dynamically
 */

// Global variable to store all books
let books = [];

/**
 * Loads books and filters out any invalid entries
 * Invalid books are those missing titles or corrupted data
 */
async function loadBooksForIndex() {
    try {
        console.log('Loading books for main page...');
        
        // Get books using the shared function from library.js
        const allBooks = await loadBooks();
        console.log('Raw books loaded:', allBooks);
        
        // Filter out invalid books (empty objects, missing titles, etc.)
        books = allBooks.filter(book => {
            // Check if book is valid: has title and is a proper object
            const isValid = book && 
                           typeof book === 'object' && 
                           book.title && 
                           book.title.trim();
            
            // Log any invalid books we're removing
            if (!isValid) {
                console.log('Filtering out invalid book:', book);
            }
            
            return isValid;
        });
        
        console.log('Valid books after filtering:', books);
        
    } catch (error) {
        console.error('Error loading books for index:', error);
        books = []; // Set empty array if loading fails
    }
}

/**
 * Navigates to the book detail page
 * Parameter: bookIndex - position of book in the books array
 */
function showBookDetail(bookIndex) {
    const book = books[bookIndex];
    
    // Make sure the book exists and has an ID
    if (!book || !book.id) {
        console.error('Cannot show details: book not found or missing ID');
        return;
    }
    
    // Navigate to detail page with book ID in URL
    window.location.href = 'detailpage.html?id=' + book.id;
}

/**
 * Searches through books by title, author, or tags
 * Parameter: query - what the user typed in the search box
 */
function searchBooks(query) {
    // If search box is empty, show all books
    if (!query.trim()) {
        updateDisplay();
        return;
    }
    
    console.log('Searching for:', query);
    
    // Filter books that match the search query
    const filteredBooks = books.filter(book => {
        const searchTerm = query.toLowerCase();
        
        // Check if search term appears in title
        const titleMatch = book.title.toLowerCase().includes(searchTerm);
        
        // Check if search term appears in author
        const authorMatch = book.author && 
                           book.author.toLowerCase().includes(searchTerm);
        
        // Check if search term appears in any tag
        const tagMatch = book.tags && book.tags.some(tag => 
            tag.toLowerCase().includes(searchTerm)
        );
        
        return titleMatch || authorMatch || tagMatch;
    });
    
    console.log('Search results:', filteredBooks);
    
    // Update the bookshelf to show only matching books
    updateBookshelf(filteredBooks);
}

/**
 * Updates the page title and shows/hides empty library message
 * This function manages the overall display state
 */
function updateDisplay() {
    // Update the library title with book count
    const titleElement = document.querySelector('h3');
    titleElement.textContent = 'Your Library (' + books.length + ' books)';
    
    // Find the empty library message elements
    const emptyTitle = document.querySelector('h4');
    const emptyMessage = document.querySelector('center p');
    
    // Show or hide empty library message based on book count
    if (books.length === 0) {
        // Show empty library message
        if (emptyTitle) emptyTitle.style.display = 'block';
        if (emptyMessage) emptyMessage.style.display = 'block';
    } else {
        // Hide empty library message
        if (emptyTitle) emptyTitle.style.display = 'none';
        if (emptyMessage) emptyMessage.style.display = 'none';
    }
    
    // Update the bookshelf with all books
    updateBookshelf(books);
}

/**
 * Creates and displays the visual bookshelf
 * Parameter: booksToShow - array of books to display (for search results)
 */
function updateBookshelf(booksToShow) {
    console.log('Updating bookshelf with books:', booksToShow);
    
    // Get the table where we'll show books
    const table = document.getElementById('bookshelf-table');
    const booksPerRow = 8; // How many books fit in one row
    
    // Clear any existing books from the table
    table.innerHTML = '';
    
    // If no books to show, display a message
    if (!booksToShow || booksToShow.length === 0) {
        const row = table.insertRow();
        const cell = row.insertCell();
        cell.colSpan = booksPerRow; // Make cell span the full width
        cell.innerHTML = '<p>No books to display</p>';
        cell.style.textAlign = 'center';
        cell.style.padding = '20px';
        return;
    }
    
    // Calculate how many rows we need
    const totalRows = Math.ceil(booksToShow.length / booksPerRow);
    let bookIndex = 0; // Keep track of which book we're on
    
    // Create each row of the bookshelf
    for (let row = 0; row < totalRows; row++) {
        const tableRow = table.insertRow();
        
        // Calculate how many books go in this row
        const cellsInThisRow = Math.min(booksPerRow, booksToShow.length - bookIndex);
        
        // Create each book cell in this row
        for (let col = 0; col < cellsInThisRow; col++) {
            const cell = tableRow.insertCell();
            
            // Set cell appearance
            cell.width = '60';
            cell.height = '80';
            cell.align = 'center';
            cell.style.verticalAlign = 'top';
            cell.style.padding = '5px';
            
            const book = booksToShow[bookIndex];
            console.log('Processing book at index', bookIndex, ':', book);
            
            if (book && book.title) {
                // Find this book's position in the main books array
                const originalIndex = books.indexOf(book);
                const title = String(book.title).trim();
                const author = book.author ? String(book.author).trim() : 'Unknown';
                
                // Show cover image if available, otherwise show book emoji
                if (book.coverImage && book.coverImage.trim()) {
                    // Create HTML with cover image and fallback
                    cell.innerHTML = 
                        '<img src="' + book.coverImage + '" ' +
                        'width="50" height="65" ' +
                        'style="object-fit: cover; border-radius: 3px;" ' +
                        'onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';">' +
                        '<div style="display: none;">📚</div>' +
                        '<br><small style="font-size: 9px;">' + 
                        (title.length > 8 ? title.substring(0, 8) + '...' : title) + 
                        '</small>';
                } else {
                    // No cover image, just show emoji and title
                    cell.innerHTML = '📚<br><small>' + 
                        (title.length > 6 ? title.substring(0, 6) + '...' : title) + 
                        '</small>';
                }
                
                // Make cell clickable
                cell.onclick = function() { 
                    showBookDetail(originalIndex); 
                };
                cell.title = title + ' by ' + author; // Tooltip on hover
                cell.style.cursor = 'pointer';
                cell.style.backgroundColor = '#e8f4f8';
                
            } else {
                // Invalid book - show error indicator
                console.log('Invalid book found:', book);
                cell.innerHTML = '❓';
                cell.style.cursor = 'default';
                cell.style.backgroundColor = '#ffcccc';
            }
            
            bookIndex++; // Move to next book
        }
    }
}

/**
 * Page initialization
 * This runs when the page finishes loading
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Main page loaded, initializing...');
    
    // Load all books from server
    await loadBooksForIndex();
    
    // Update the display
    updateDisplay();
    
    // Set up search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchBooks(e.target.value);
        });
    }
});

/**
 * Refresh books when user returns to this page
 * This handles the case where user adds a book and comes back
 */
window.addEventListener('focus', async function() {
    console.log('Page focused, checking for new books...');
    
    const oldBooksLength = books.length;
    await loadBooksForIndex();
    
    // If book count changed, update the display
    if (books.length !== oldBooksLength) {
        console.log('Books changed, updating display');
        updateDisplay();
    }
});
