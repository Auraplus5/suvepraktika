package com.cgi.library.service;

import com.cgi.library.entity.Book;
import com.cgi.library.entity.CheckOut;
import com.cgi.library.model.BookStatus;
import com.cgi.library.model.CheckOutDTO;
import com.cgi.library.repository.BookRepository;
import com.cgi.library.repository.CheckOutRepository;
import com.cgi.library.util.ModelMapperFactory;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class CheckOutService {

    @Autowired
    private CheckOutRepository checkOutRepository;
    @Autowired
    private BookRepository bookRepository;

    public Page<CheckOutDTO> getCheckOuts(Pageable pageable) {
        ModelMapper modelMapper = ModelMapperFactory.getMapper();
        return checkOutRepository.findAll(pageable).map(checkOut -> modelMapper.map(checkOut, CheckOutDTO.class));
    }

    public CheckOutDTO getCheckOut(UUID checkOutId) {
        CheckOut checkOut = checkOutRepository.getOne(checkOutId);
        return ModelMapperFactory.getMapper().map(checkOut, CheckOutDTO.class);
    }

    @Transactional
    public void checkout(CheckOutDTO checkOutDTO) {

        if (checkOutDTO.getId() != null) {
            throw new IllegalStateException("ID should not be included");
        }

        Book book = bookRepository
                .findById(checkOutDTO.getBorrowedBookId())
                .orElseThrow(() -> new EntityNotFoundException("Book not found"));

        if (book.getStatus() != BookStatus.AVAILABLE) {
            throw new IllegalStateException("Book is not available for checkout");
        }

        LocalDate dueDate = LocalDate.now().plusDays(14);

        book.setStatus(BookStatus.BORROWED);
        book.setCheckOutCount(book.getCheckOutCount() + 1);
        book.setDueDate(dueDate);

        CheckOut checkOut = new CheckOut();

        checkOut.setId(UUID.randomUUID());
        checkOut.setBorrowedBook(book);
        checkOut.setBorrowerFirstName(checkOutDTO.getBorrowerFirstName());
        checkOut.setBorrowerLastName(checkOutDTO.getBorrowerLastName());
        checkOut.setCheckedOutDate(LocalDate.now());
        checkOut.setDueDate(dueDate);

        checkOutRepository.save(checkOut);
    }

    public void updateCheckOut(CheckOutDTO checkOutDTO) {
        CheckOut dbCheckout = checkOutRepository.findById(checkOutDTO.getId()).orElseThrow();
        ModelMapperFactory.getMapper().map(checkOutDTO, dbCheckout);
        checkOutRepository.save(dbCheckout);
    }

    public void deleteCheckOut(UUID checkOutId) {
        checkOutRepository.deleteById(checkOutId);
    }

    public void returnBook(UUID checkOutId) {
        CheckOut checkOut = checkOutRepository.findById(checkOutId).orElseThrow(() ->
                new EntityNotFoundException("Checkout not found"));

        if (checkOut.getReturnedDate() != null) return;

        checkOut.setReturnedDate(LocalDate.now());
        checkOut.setDueDate(null);
        Book book = checkOut.getBorrowedBook();
        if (book != null) {
            book.setDueDate(null);
            book.setStatus(BookStatus.RETURNED);
            bookRepository.save(book);
        }
        checkOutRepository.save(checkOut);
    }
}
