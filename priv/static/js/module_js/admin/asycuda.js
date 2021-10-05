


// ----------------------------------------- Sweet Alert
$(document).ajaxStop($.unblockUI);
$(document).ready(function() {
    jQuery.fn.dataTable.Api.register( 'processing()', function ( show ) {
        return this.iterator( 'table', function ( ctx ) {
            ctx.oApi._fnProcessingDisplay( ctx, show );
        } );
    } );

    function formatSearchDetails ( d ) {
        return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
            '<tr>'+
                '<td>Port: '+format_value(d.port)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Branch Code: '+format_value(d.branch_code)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Interest Amount: '+format_value(d.interest_amount)+'</td>'+
            '</tr>'+         
            '<tr>'+
                '<td>Debit account: '+format_value(d.dr_acc)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Bank Reference: '+format_value(d.cbs_ref)+'</td>'+
            '</tr>'+
                '<td>Payment Status: '+format_value(d.status_description)+'</td>'+
            '</tr>'+
            '</tr>'+
                '<td>Status Description: '+format_value(d.txn_descript)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Date initiated: '+format_value(d.initiator_date)+'</td>'+
            '</tr>'+         
        '</table>';
    }

    function button_options(data, row){
        var init_btn ='<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="margin-top:0px !important; padding-top: 0px !important;">Options</button>'+
        '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">';
        var rcpt_btn = '<a href="/Asycuda/Reciept?id='+data+'" class="dropdown-item text-success reciept">Reciept</a>';
        var trail_btn = '<a href="#" data-ref_id="'+row.ref_id+'" class="dropdown-item text-success approval_tray">Approval Trail</a></div>';
        var notif_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-success aw_reset_notif">Retry Notification</a>';
        var pay_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-success aw_reset_payment">Retry payment</a>';
        var drop_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-danger drop_aw_payment">Drop payment</a>';
        var complete_txn_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-success update_to_pending_zra_settlement">Confirm as Processed</a>';
        var kyc_btn = '<a href="#" data-ref_id="'+row.ref_id+'" class="dropdown-item text-success view_kyc">View KYC</a></div>';
        var status = row.status
        var mode = row.txn_mode 

        if(status == "COMPLETE"){
            return (mode == "PORTAL")? init_btn+rcpt_btn+trail_btn : init_btn+rcpt_btn+kyc_btn;
        }else if(status == "PENDING_APPROVAL"){
            return init_btn+trail_btn+drop_btn;
        }else if(status == "DROPPED"){
            return init_btn+trail_btn;
        }else if
        ((status == "PENDING_BANK_PAYMENT") || (status == "PENDING_ZRA_SETTLEMENT")){
            return (mode == "PORTAL")? init_btn+trail_btn : init_btn+kyc_btn;
        }else if(status == "FAILED_NOTIFICATION"){
            return (mode == "PORTAL")? init_btn+notif_btn+trail_btn : init_btn+notif_btn+kyc_btn;
        }else if(status == "PENDING_BANK_VERIFICATION"){
            return (mode == "PORTAL")? init_btn+pay_btn+drop_btn+trail_btn : init_btn+pay_btn+kyc_btn;
        }else if(status == "PENDING_VERIFICATION"){
            return init_btn+pay_btn+drop_btn+complete_txn_btn+trail_btn;
        }else if(status == "FAILED_VALIDATION_SETTLEMENT"){
            return (mode == "PORTAL")? init_btn+notif_btn+drop_btn+trail_btn : init_btn+drop_btn+kyc_btn;
        }else if(status == "FAILED_VALIDATION"){
            return (mode == "PORTAL")? init_btn+pay_btn+drop_btn+trail_btn : init_btn+pay_btn+kyc_btn;
        }else if(status == "PENDING_VALIDATION"){
            return (mode == "PORTAL")? init_btn+pay_btn+drop_btn+trail_btn : init_btn+pay_btn+drop_btn+kyc_btn;
        }else if(status == "PENDING_REVERSAL"){
            return (mode == "PORTAL")? init_btn+drop_btn+trail_btn : init_btn+drop_btn+kyc_btn;
        }else if(status == "FAILED_SETTLEMENT" || status == "ENTRY_NOT_FOUND"){
            if(row.payment_status == "COMPLETE"){
                return (mode == "PORTAL")? init_btn+notif_btn+drop_btn+trail_btn : init_btn+notif_btn+kyc_btn;
            }else{
                return (mode == "PORTAL")? init_btn+drop_btn+trail_btn : init_btn+kyc_btn;
            }
        }else{
            return '<span class="text-danger">No Actions</span>'; 
        }
    }


    //------------------------------- CLIENT REPORT -----------------------------    
    // var tbl_aw_admin_report = $('#aw_admin').DataTable({
    //     "serverSide": true,
    //     "responsive": true,
    //     "processing": true,
    //     'language': {
    //         'loadingRecords': '&nbsp;',
    //         processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> '
    //     },
    //     'ajax': {
    //         "type"   : "POST",
    //         "url"    : '/assessments/admin/report',
    //         "data"   : {
    //             "_csrf_token": $("#csrf").val(),
    //             "type": $("#type").val(),
    //             "tpin": $("#tpin").val(),
    //             "d_code": $("#d_code").val(),
    //             "reg_year": $("#reg_year").val(),
    //             "reg_num": $("#reg_num").val(),
    //             "currency": $("#currency").val(),
    //             "status": $("#status").val(),
    //             "from": $("#from").val(),
    //             "to": $("#to").val(),
    //         },
    //         "dataSrc": function (data) {
    //             if (data.error){
    //                 $('.error').text(data.error);
    //             }else{
    //                 return data.data;
    //             } 
    //         }     
    //     },
    //     "paging": true,
    //     "columns": [
    //         {
    //             "className": 'details-control',
    //             "orderable": false,
    //             "data": null,
    //             "defaultContent": ''
    //         },
    //         {"data": "tpin"},
    //         {"data": "company_name"},
    //         {"data": "declarant_code"},
    //         {"data": "reg_num"},
    //         {"data": "reg_year"},
    //         {"data": "currency"},
    //         {"data": "amount"},
    //         {"data": "interest_amount"},
    //         {
    //             "data": "status",
    //             "render": function (data, type, row) {
    //                 return formartStatus(data)
    //             }
    //         },
    //         {
    //             "data": "id",
    //             "render": function ( data, type, row ) {
    //                 return button_options(data, row)
    //             },
    //         },

    //     ],
    //     "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
    //     "order": [[1, 'asc']]
    // }); 


    var tbl_aw_admin_report = $('#aw_admin').DataTable({
        "serverSide": true,
        "responsive": true,
        "processing": true,
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> '
        },
        'ajax': {
            "type"   : "POST",
            "url"    : '/assessments/admin/report',
            "data"   : {
                "_csrf_token": $("#csrf").val(),
                "type": $("#type").val(),
                "tpin": $("#tpin").val(),
                "d_code": $("#d_code").val(),
                "reg_year": $("#reg_year").val(),
                "reg_num": $("#reg_num").val(),
                "currency": $("#currency").val(),
                "status": $("#status").val(),
                "from": $("#from").val(),
                "to": $("#to").val(),
            },
            "dataSrc": function (data) {
                if (data.error){
                    $('.error').text(data.error);
                }else{
                    return data.data;
                } 
            }     
        },
        "paging": true,
        "columns": [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            {"data": "tpin"},
            {"data": "declarant_code"},
            {"data": "company_name",
             "render": function (data, type, row){
                 if(data != null){
                    return data.toUpperCase();
                 }else{
                     return data;
                 }
                 
             }},
            {"data": "reg_num"},
            // {"data": "reg_year"},
            {"data": "currency"},
            {"data": "amount"},
            {"data": "interest_amount"},
            {
                "data": "status",
                "render": function (data, type, row) {
                    return formartStatus(data)
                }
            },
            {
                "data": "id",
                "render": function ( data, type, row ) {
                    return button_options(data, row)
                },
            },

        ],
        "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
        "order": [[1, 'asc']]
    }); 


    $('#btn_aw_admin_filter').on( 'click', function () {
        tbl_aw_admin_report.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.type = $('#type').val();
            data.tpin = $('#tpin').val();
            data.d_code = $('#d_code').val();
            data.reg_year = $('#reg_year').val();
            data.reg_num = $('#reg_num').val();
            data.currency = $('#currency').val();
            data.status = $('#status').val();
            data.from = $('#from').val();
            data.to = $('#to').val();  
        } );
        $('#filter').modal('hide');
        tbl_aw_admin_report.draw();
    });

    $('#aw_admin').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = tbl_aw_admin_report.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            row.child(formatSearchDetails(row.data())).show();
            tr.addClass('shown');
        }
    });

    $('#reload_table').on( 'click', function () {
		tbl_aw_admin_report.ajax.reload();
    });

    $('#aw_admin_excel').on( 'click', function (event) {
        $('#awSearchForm').attr('action', '/asycuda/admin/export/excel');
        $('#awSearchForm').attr('method', 'GET');
        $("#awSearchForm").submit();
    });




    
    $('#aw_admin tbody').on('click', '.approval_tray', function () {
		$.ajax({
            url: "/report/approval/trial",
            type: 'POST',
            data: {
                ref_id: $(this).attr("data-ref_id"),
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.data){
                    approval_trial_modal(result.data)
                } else {
                    Swal.fire(
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
        })
    });

    // $('#aw_admin').on('click', '.approval_tray', function() {
    //     var btn = $(this);
    //     var ref_id = btn.attr("data-ref_id")
    //         $.blockUI();
    //         $.ajax({
    //             url: "/report/approval/trial",
    //             type: 'POST',
    //             data: {
    //                 ref_id: ref_id, 
    //                 _csrf_token: $('#csrf').val()
    //             },
    //             success: function(result) {
    //                 if (result.data){
    //                     approval_trial_modal(result.data)
    //                 } else {
    //                     Swal.fire(
    //                         'Oops',
    //                         result.error,
    //                         'error'
    //                     )
    //                 }
    //             },
    //             error: function(request, msg, error) {
    //                 Swal.fire(
    //                     'Oops..',
    //                     'Something went wrong! try again',
    //                     'error'
    //                 )
    //             }
    //         });
    
    // });

    $('#reload_table').on( 'click', function () {
		tbl_aw_admin_report.ajax.reload();
    });

    //------------RESET NOTIFICATION TRY---------
    $('#aw_admin tbody').on( 'click', '.aw_reset_notif', function (event) {
        Swal.fire({
            title: 'Are you sure you want to try ZRA Notification?',
            text: "proceed To Try Notification",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.blockUI();
                $.ajax({
                    url: "/assessment/admin/reset/notif",
                    type: 'POST',
                    data: {
                        id: $(event.target).attr("data-id"), 
                        _csrf_token: $('#csrf').val()
                    },
                    success: function(result) {
                        if (result.data){
                            if (result.data){
                                Swal.fire(
                                    'Success',
                                    result.data,
                                    'success'
                                ).then(function(){ 
                                    location.reload();
                                    }
                                );  
                            }else{
                                Swal.fire(
                                    'Oops..',
                                    result.error,
                                    'error'
                                )
                            }
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
            } else {
                Swal.fire(
                    'Cancelled',
                    'Operation not performed :)',
                    'error'
                )
            }
        })
    });

    //------------RESET PAYMENT TRY---------
    // $('#aw_admin tbody').on( 'click', '.aw_reset_payment', function (event) {
    //     Swal.fire({
    //         title: 'Are you sure you want to retry Bank payment?',
    //         text: "proceed With Payment",
    //         type: "warning",
    //         showCancelButton: true,
    //         confirmButtonColor: '#3085d6',
    //         cancelButtonColor: '#d33',
    //         confirmButtonText: 'Yes, continue!',
    //         showLoaderOnConfirm: true
    //         }).then((result) => {
    //         if (result.value) {
    //             $.blockUI();
    //             $.ajax({
    //                 url: "/assessment/admin/reset/bankpayment",
    //                 type: 'POST',
    //                 data: {
    //                     id: $(event.target).attr("data-id"), 
    //                     _csrf_token: $('#csrf').val()
    //                 },
    //                 success: function(result) {
    //                     if (result.data){
    //                         if (result.data){
    //                             Swal.fire(
    //                                 'Success',
    //                                 result.data,
    //                                 'success'
    //                             ).then(function(){ 
    //                                 location.reload();
    //                                 }
    //                             );  
    //                         }else{
    //                             Swal.fire(
    //                                 'Oops..',
    //                                 result.error,
    //                                 'error'
    //                             )
    //                         }
    //                     } else {
    //                         Swal.fire(
    //                             'Oops',
    //                             result.error,
    //                             'error'
    //                         )
    //                     }
    //                 },
    //                 error: function(request, msg, error) {
    //                     Swal.fire(
    //                         'Oops..',
    //                         'Something went wrong! try again',
    //                         'error'
    //                     )
    //                 }
    //             });
    //         } else {
    //             Swal.fire(
    //                 'Cancelled',
    //                 'Operation not performed :)',
    //                 'error'
    //             )
    //         }
    //     })
    // });


    //============================RESET PAYMENT TRY===================================
$('#aw_admin tbody').on('click', '.aw_reset_payment', function () {
    var btn = $(this);

    Swal.fire({
        title: 'Are you sure you want to retry Bank payment?',
        text: "proceed With Reactivation of Payment",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, continue!',
        showLoaderOnConfirm: true
        }).then((result) => {
        if (result.value) {
            $.ajax({
                url: "/assessment/admin/reset/bankpayment",
                    type: 'POST',
                    data: {
                        "id": btn.attr("data-id"),
                        _csrf_token: $('#csrf').val()
                    },
                    success: function(result) {
                        if (result.data){
                            if (result.data){
                                Swal.fire(
                                    'Success',
                                    result.data,
                                    'success'
                                ).then(function(){ 
                                    location.reload();
                                    }
                                );  
                            }else{
                                Swal.fire(
                                    'Oops..',
                                    result.error,
                                    'error'
                                )
                            }
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
        } else {
            Swal.fire(
                'Cancelled',
                'Operation not performed :)',
                'error'
            )
        }
    })
});









    //============================DROP PAYMENT TRY===================================
    $('#aw_admin tbody').on('click', '.drop_aw_payment', function (e) {
        e.preventDefault();
        let btn = $(this);
        console.log(btn);
        let form = document.getElementById('drop_aw_payment_form');
        form.innerHTML = `
            <div class="form-group">
                <label class="form-label">Please state the reason for dropping the transaction...</label>
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fal fa-comment"></i></span>
                    </div>
                    <input type="hidden" name="_csrf_token" value="${$('#csrf').val()}">
                    <input type="hidden" name="id" id="id" value="${btn.attr("data-id")}">
                    <input type="text" name="reviewer_remarks" id="reviewer_remarks" class="form-control" placeholder="Revier Remarks" required="">
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary btn-pills waves-effect waves-themed text-whit" data-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-pills waves-effect waves-themed text-white" style="background-color: #2196F3;;">SUBMIT</button>
            </div>
        `;
        $('#drop_payments').modal('show');
    });


    $('#drop_aw_payment_form').submit(function(e) {
        e.preventDefault();
        let data = $(this).serialize();
        $('#drop_payments').modal('hide');
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will drop this payment',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Drop Payment!'
        }).then((result) => {
            if (result.value) {
                $.ajax({
                    type: 'POST',
                    url: '/assessment/admin/drop/bankpayment',
                    data: data,
                    success: function (result) {
                        if (result.data) {
                            Swal.fire(
                                'Success',
                                'User Details Succesfully Updated!',
                                'success'
                            )
                            location.reload(true);
                        } else {
                            Swal.fire(
                                'Failed!',
                                response.message,
                                'error'
                            )
                            location.reload(true);
                        }
                    }
                });
            } else {
                Swal.fire(
                    'Cancelled!',
                    'Operation cancelled :)',
                    'error'
                )
            }
        });
    });









    
     //=========================Proceed Payment For Pending Settlement/ Update========================
  $('#aw_admin tbody').on('click', '.update_to_pending_zra_settlement', function (e) {
    e.preventDefault();
    let btn = $(this);
    console.log(btn);
    let form = document.getElementById('confirm_asycuda_payment_form');
    form.innerHTML = `
        <div class="form-group">
            <label class="form-label">Please Enter the Bank Reference Below...</label>
            <div class="input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text"><i class="fal fa-pen"></i></span>
                </div>
                <input type="hidden" name="_csrf_token" value="${$('#csrf').val()}">
                <input type="hidden" name="id" id="id" value="${btn.attr("data-id")}">
                <input type="text" name="reference" id="reference" class="form-control" placeholder="Bank Reference" required="">
            </div>
        </div>

        <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-pills waves-effect waves-themed text-whit" data-dismiss="modal">Close</button>
            <button type="submit" class="btn btn-pills waves-effect waves-themed text-white" style="background-color: #2196F3;;">SUBMIT</button>
        </div>
    `;
    $('#confirm_asycuda_payments').modal('show');
});


$('#confirm_asycuda_payment_form').submit(function(e) {
    e.preventDefault();
    let data = $(this).serialize();
    $('#confirm_asycuda_payments').modal('hide');
    Swal.fire({
        title: 'Update Payment into PENDING_ZRA_SETTLEMENT?',
        text: "CAUTION: This applies to transactions where a client has been debited but the transaction remains in PENDING_VERIFIACTION!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Update Entry!'
    }).then((result) => {
        if (result.value) {
            $.blockUI();
            $.ajax({
                type: 'POST',
                url: '/Process/Payment/Pending/ZRA/Settlement',
                data: data,
                success: function (result) {
                    if (result.data) {
                        Swal.fire(
                            'Success',
                            'Payment confirmed successfully!',
                            'success'
                        )
                        location.reload();
                    } else {
                        Swal.fire(
                            'Error!',
                            response.message,
                            'error'
                        )
                        location.reload();
                    }
                }
            });
        } else {
            Swal.fire(
                'Cancelled!',
                'Payment confirmation cancelled.',
                'error'
            )
        }
    });
});




//   $('#aw_admin tbody').on('click', '.update_to_pending_zra_settlement', function () {
//     var btn = $(this);

//     Swal.fire({
//         title: 'Update Payment into PENDING_ZRA_SETTLEMENT?',
//         text: "CAUTION: This applies to transactions where a client has been debited but the transaction somehow remains in PENDING_VERIFIACTION!",
//         type: "warning",
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, continue!',
//         showLoaderOnConfirm: true
//         }).then((result) => {
//         if (result.value) {
//             $.ajax({
//                 url: '/Process/Payment/Pending/ZRA/Settlement',
//                 type: 'post',
//                 data: {
//                     _csrf_token: $('#csrf').val(),
//                    "id": btn.attr("data-id")
//                 },
//                 success: function(result) {
//                     if (result.data){
//                         Swal.fire(
//                             'Success',
//                             'Payment Escalated Succesfully to PENDING_ZRA_SETTLEMENT!',
//                             'success'
//                         )
//                         location.reload(true);
//                     } else {
//                         Swal.fire(
//                             'Oops',
//                             result.error,
//                             'error'
//                         )
//                         location.reload(true);
//                     }
//                 },
//                 error: function(request, msg, error) {
//                     Swal.fire(
//                         'Oops..',
//                         'Something went wrong! try again',
//                         'error'
//                     )
//                 }
//             });
//         } else {
//             Swal.fire(
//                 'Cancelled',
//                 'Operation not performed :)',
//                 'error'
//             )
//         }
//     })
// });







    //========================== test service ================================
   

    jQuery.fn.dataTable.Api.register( 'processing()', function ( show ) {
        return this.iterator( 'table', function ( ctx ) {
            ctx.oApi._fnProcessingDisplay( ctx, show );
        } );
    } );


    var tbl_admin_test = $('#tbl_admin_test_cust').DataTable({
        "responsive": true,
        "processing": true,
        "select": {
            "style": 'multi',
            "selector": 'td:first-child'
        },
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
            "emptyTable": "No Assessments"
        },
        "paging": true,
        "pageLength": 10,
        "serverSide": false,
        "columns": [
            {"data": "tpin"},
            {"data": "reg_num"},
            {"data": "declarant_code"},
            {"data": "port"},
            {"data": "reg_year"},
            {"data": "reg_serial"},
            {"data": "amount"},
            {
                "data": "has_interest",
                "render": function ( data, type, row ) {
                    if(data == "1"){
                        return "YES";
                    } else{
                        return "NO";
                    }
                }
            },
            {"data": "interest_amount"}
        ],
        "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
        "order": [[1, 'asc']],
        'columnDefs': [
            {
                "targets": 2,
                "className": "text-center"
            },
            {
                "targets": 3,
                "className": "text-center"
            },
            {
                "targets": 6,
                "className": "text-center"
            }
        ],
        responsive: true,
        lengthChange: false,
        dom:
            "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>"
    });

   
    function populate_assessments(data) {
        if (data.data.length == 0) {
            tbl_admin_test.context[0].oLanguage.sEmptyTable = "No Assessments Found...";
            tbl_admin_test.clear().draw();
            tbl_admin_test.processing(false);
        }
        else{
            tbl_admin_test.processing(false);
            tbl_admin_test.clear().draw();
            tbl_admin_test.rows.add(data.data);
            tbl_admin_test.columns.adjust().draw();
        }
        tbl_admin_test.processing(false);  
    }

    $('#fetch_admin_asmnt').on( 'click', function () {
        var tpin = $("#tpin_input").val();
        tbl_admin_test.clear().draw();

        if(tpin){
            $.blockUI();
            $.ajax({
                type: "POST",
                url: "/assessment/admin/test/fetch",
                dataType: "json",
                timeout: 90000,
                data: {
                    _csrf_token: $("#csrf").val(),
                    tpin: tpin,
                    is_agent:  $("#is_agent").val()
                },
                success: function(data) {
                    if(data.data){
                        populate_assessments(data)
                    }
                    else{
                        Swal.fire(
                            'Oops..',
                            data.error,
                            'error'
                        ) 
                    }
                },
            });

        }
        else{
            tbl_admin_test.processing(false);
            Swal.fire(
                'Oops..',
                "Enter Client Tpin/Declarant code",
                'error'
            ) 
        }
    });

    //---------------------- EXCEPTIONS --------------------------
    var tbl_aw_exceptions = $('#aw_exceptions').DataTable({
        "serverSide": true,
        "responsive": true,
        "processing": true,
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> '
        },
        'ajax': {
            "type"   : "POST",
            "url"    : '/asycuda/admin/exceptions',
            "data"   : {
                "_csrf_token": $("#csrf").val(),
                "type": $("#type").val(),
                "tpin": $("#tpin").val(),
                "d_code": $("#d_code").val(),
                "reg_year": $("#reg_year").val(),
                "reg_num": $("#reg_num").val(),
                "currency": $("#currency").val(),
                "status": $("#status").val(),
                "from": $("#from").val(),
                "to": $("#to").val(),
            },
            "dataSrc": function (data) {
                if (data.error){
                    $('.error').text(data.error);
                }else{
                    return data.data;
                } 
            }     
        },
        "paging": true,
        "columns": [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            {"data": "tpin"},
            {"data": "declarant_code"},
            {"data": "reg_num"},
            {"data": "reg_year"},
            {"data": "currency"},
            {"data": "amount"},
            {"data": "interest_amount"},
            {
                "data": "status",
                "render": function (data, type, row) {
                    return formartStatus(data)
                }
            },
            {
                "data": "id",
                "render": function ( data, type, row ) {
                    return button_options(data, row)
                },
            },

        ],
        "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
        "order": [[1, 'asc']]
    }); 


    $('#btn_aw_admin_filter').on( 'click', function () {
        tbl_aw_exceptions.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.type = $('#type').val();
            data.tpin = $('#tpin').val();
            data.d_code = $('#d_code').val();
            data.reg_year = $('#reg_year').val();
            data.reg_num = $('#reg_num').val();
            data.currency = $('#currency').val();
            data.status = $('#status').val();
            data.from = $('#from').val();
            data.to = $('#to').val();  
        } );
        $('#filter').modal('hide');
        tbl_aw_exceptions.draw();
    });

    $('#aw_exceptions').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = tbl_aw_exceptions.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            row.child(formatSearchDetails(row.data())).show();
            tr.addClass('shown');
        }
    });

    $('#reload_table').on( 'click', function () {
		tbl_aw_exceptions.ajax.reload();
    });

    // Exception Notification Reset
    $('#aw_exceptions tbody').on( 'click', '.aw_reset_notif', function (event) {
        Swal.fire({
            title: 'Are you sure you want to try ZRA Notification?',
            text: "proceed To Try Notification",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.blockUI();
                $.ajax({
                    url: "/assessment/admin/reset/notif",
                    type: 'POST',
                    data: {
                        id: $(event.target).attr("data-id"), 
                        _csrf_token: $('#csrf').val()
                    },
                    success: function(result) {
                        if (result.data){
                            if (result.data){
                                Swal.fire(
                                    'Success',
                                    result.data,
                                    'success'
                                ).then(function(){ 
                                    location.reload();
                                    }
                                );  
                            }else{
                                Swal.fire(
                                    'Error!..',
                                    result.error,
                                    'error'
                                )
                            }
                        } else {
                            Swal.fire(
                                'Error!',
                                result.error,
                                'error'
                            )
                        }
                    },
                    error: function(request, msg, error) {
                        Swal.fire(
                            'Error!..',
                            'Something went wrong! try again',
                            'error'
                        )
                    }
                });
            } else {
                Swal.fire(
                    'Cancelled',
                    'Operation not performed.',
                    'error'
                )
            }
        })
    });

    // Exception Payment Reset
    $('#aw_exceptions tbody').on('click', '.aw_reset_payment', function () {
        var btn = $(this);
    
        Swal.fire({
            title: 'Are you sure you want to retry Bank payment?',
            text: "proceed With Reactivation of Payment",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: "/assessment/admin/reset/bankpayment",
                        type: 'POST',
                        data: {
                            "id": btn.attr("data-id"),
                            _csrf_token: $('#csrf').val()
                        },
                        success: function(result) {
                            if (result.data){
                                if (result.data){
                                    Swal.fire(
                                        'Success',
                                        result.data,
                                        'success'
                                    ).then(function(){ 
                                        location.reload();
                                        }
                                    );  
                                }else{
                                    Swal.fire(
                                        'Error!..',
                                        result.error,
                                        'error'
                                    )
                                }
                            } else {
                                Swal.fire(
                                    'Error!',
                                    result.error,
                                    'error'
                                )
                            }
                        },
                    error: function(request, msg, error) {
                        Swal.fire(
                            'Error!..',
                            'Something went wrong! try again',
                            'error'
                        )
                    }
                });
            } else {
                Swal.fire(
                    'Cancelled',
                    'Operation not performed.',
                    'error'
                )
            }
        })
    });

    //Exception Drop Payment
    $('#aw_exceptions tbody').on('click', '.drop_aw_payment', function (e) {
        e.preventDefault();
        let btn = $(this);
        console.log(btn);
        let form = document.getElementById('drop_aw_payment_form');
        form.innerHTML = `
            <div class="form-group">
                <label class="form-label">Please state the reason for dropping the transaction...</label>
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fal fa-comment"></i></span>
                    </div>
                    <input type="hidden" name="_csrf_token" value="${$('#csrf').val()}">
                    <input type="hidden" name="id" id="id" value="${btn.attr("data-id")}">
                    <input type="text" name="reviewer_remarks" id="reviewer_remarks" class="form-control" placeholder="Revier Remarks" required="">
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary btn-pills waves-effect waves-themed text-whit" data-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-pills waves-effect waves-themed text-white" style="background-color: #2196F3;">SUBMIT</button>
            </div>
        `;
        $('#drop_payments').modal('show');
    });
});



