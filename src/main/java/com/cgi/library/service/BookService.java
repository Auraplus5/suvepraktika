package com.cgi.library.service;

import com.cgi.library.entity.Book;
import com.cgi.library.model.BookDTO;
import com.cgi.library.model.BookStatus;
import com.cgi.library.repository.BookRepository;
import com.cgi.library.util.ModelMapperFactory;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public Page<BookDTO> getBooks(String title, BookStatus bookStatus, Pageable pageable) {
        ModelMapper modelMapper = ModelMapperFactory.getMapper();
        boolean hasTitle = title != null && !title.isBlank();
        boolean hasStatus = bookStatus != null;
        Page<Book> books;
        if (hasTitle && hasStatus) {
            books = bookRepository.findByStatusAndTitleContainingIgnoreCase(bookStatus, title, pageable);
        } else if(hasTitle) {
            books = bookRepository.findByTitleContainingIgnoreCase(title, pageable);
        } else if(hasStatus) {
            books = bookRepository.findByStatus(bookStatus, pageable);
        } else {
            books = bookRepository.findAll(pageable);
        }
        return books.map(book -> modelMapper.map(book, BookDTO.class));
    }

    public BookDTO getBook(UUID bookId) {
        Book book = bookRepository.getOne(bookId);
        return ModelMapperFactory.getMapper().map(book, BookDTO.class);
    }

    public Set<String> getSuggestions(String title) {
        Pageable limit = PageRequest.of(0, 5);
        return bookRepository.findByTitleContainingIgnoreCase(title, limit)
                .map(Book::getTitle)
                .toSet();
    }

    public UUID saveBook(BookDTO bookDTO) {
        ModelMapper modelMapper = ModelMapperFactory.getMapper();
        return bookRepository.save(modelMapper.map(bookDTO, Book.class)).getId();
    }

    public void deleteBook(UUID bookId) {
        bookRepository.deleteById(bookId);
    }
}
