


// ----------------------------------------- Sweet Alert
$(document).ajaxStop($.unblockUI);
$(document).ready(function() {

    $('.domt_old_receipt').on( 'click', function (event) {
        var btn = $(this);
        var prn_id = btn.attr("data-prn_id");
        $.blockUI();
        $.ajax({
            url: "/domt/reciept",
            type: 'POST',
            data: {
                prn_id: prn_id, 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.data){
                    domt_reciept_modal(result)
                } else {
                    Swal.fire(
                        'Oops',
                        result.error,
                        'error'
                    )
                }
            },
            error: function(request, msg, error) {
                Swal.fire(
                    'Oops..',
                    'Something went wrong! try again',
                    'error'
                )
            }
        });
 
     });


     function domt_reciept_modal(result){
        var prn = result.data
        console.log(prn)
        var txn_amount =  formartAmount(prn.amount)
        var modal = $('#domt_reciept')
        modal.find('.modal-body #tax_payer').text(prn.tax_payer_name);
        modal.find('.modal-body #Payment_date').text(prn.payment_date);
        modal.find('.modal-body #Prn_date').text(prn.prn_date);
        modal.find('.modal-body #tpin').text(prn.tpin);
        modal.find('.modal-body #prn').text(prn.prn);
        modal.find('.modal-body #address').text(prn.address);
        modal.find('.modal-body #bank_ref').text(prn.bank_payment_reference);
        modal.find('.modal-body #mid').text(prn.merchant_id);
        modal.find('.modal-body #prn_amount').text(prn.amount);
        modal.find('.modal-body #amount_words').text(prn.amount_words);
        
        $('#domt_reciept').modal('show');
    }


    $('.napsa_old_receipt').on( 'click', function (event) {
        var btn = $(this);
        var id = btn.attr("data-id");
        $.blockUI();
        $.ajax({
            url: "/Old/transaction/napsa/reciept",
            type: 'POST',
            data: {
                id: id, 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.data){
                    napsa_reciept_modal(result)
                } else {
                    Swal.fire(
                        'Oops',
                        result.error,
                        'error'
                    )
                }
            },
            error: function(request, msg, error) {
                Swal.fire(
                    'Oops..',
                    'Something went wrong! try again',
                    'error'
                )
            }
        });
 
     });


     function napsa_reciept_modal(result){
        console.log(result)
        var npin = result.data
        var txn_amount =  parseFloat(npin.amount) 
        var modal = $('#napsa_reciept')
        modal.find('.modal-body #payment_date').text(npin.payment_notification_date);
        modal.find('.modal-body #bank_ref').text(npin.bank_ref);
        modal.find('.modal-body #emp_name').text(npin.employer_name);
        modal.find('.modal-body #emp_no').text(npin.employer_no);
        modal.find('.modal-body #emp_add').text("address");
        modal.find('.modal-body #npin').text(npin.npin);
        modal.find('.modal-body #npin_date').text(npin.npin_date);
        modal.find('.modal-body #npin_exp_date').text(npin.npin_exp_date);
        modal.find('.modal-body #npin_amount').text(txn_amount);
        modal.find('.modal-body #amount_words').text(npin.amount_words);
        $('#napsa_reciept').modal('show');
    }



});