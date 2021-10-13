
$(document).ready(function() {

    $('#appointment_details').on('show.bs.modal', function (event){
        var button = $(event.relatedTarget)
        var modal = $(this)
        console.log(11111, "=========", 00000000000000)
        var id = button.data('id');
        var appointment_ref = button.data('appointment_ref');
        var status = button.data('status');
        var status_note = button.data('status_note');
        var appoint_ref = button.data('appoint_ref');
        var appointment_date = button.data('appointment_date');
        var descript = button.data('descript');
        var initiated_date = button.data('initiated_date');
        var client_name = button.data('client_name');
        var initiator = button.data('initiator');
    
      
        
        modal.find('.modal-body #app_id').val(id);
        modal.find('.modal-body #ref_id').val(appointment_ref);
        modal.find('.modal-body #status').val(status);
        modal.find('.modal-body #status_note').val(status_note);
        modal.find('.modal-body #date_1').val(appointment_date);
        modal.find('.modal-body #appoint_ref').val(appoint_ref);
        modal.find('.modal-body #descript').val(descript);
        modal.find('.modal-body #intit_date').val(initiated_date);
        modal.find('.modal-body #name').val(client_name);
        modal.find('.modal-body #initiator').val(initiator);
        
    });



    $('#update_appointment_details').on('show.bs.modal', function (event){
        var button = $(event.relatedTarget)
        var modal = $(this)

        
        console.log(11111, "=========", 00000000000000)
        var id = button.data('id');
        var appointment_ref = button.data('appointment_ref');
        var status = button.data('status');
        var status_note = button.data('status_note');
        var appoint_ref = button.data('appoint_ref');
        var appointment_date = button.data('appointment_date');
        var descript = button.data('descript');
        var initiated_date = button.data('initiated_date');
        var client_name = button.data('client_name');
        var initiator = button.data('initiator');
    
      
        
        modal.find('.modal-body #app_id_update').val(id);
        modal.find('.modal-body #ref_id').val(appointment_ref);
        modal.find('.modal-body #status_update').val(status);
        modal.find('.modal-body #status_note_update').val(status_note);
        modal.find('.modal-body #date_1').val(appointment_date);
        modal.find('.modal-body #appoint_ref').val(appoint_ref);
        modal.find('.modal-body #descript').val(descript);
        modal.find('.modal-body #intit_date').val(initiated_date);
        modal.find('.modal-body #name').val(client_name);
        modal.find('.modal-body #initiator').val(initiator);
        
    });


    $('#save_update_appointment').on('click', function (event){  
        var  status_note = $('#status_note_update').val();
        var status = $('#status_update').val();
        var id = $('#app_id_update').val();

        console.log(id, "**********", 00000, status_note, status)
       
        if((status_note = "" || status_note == undefined) || (status == "" || status == undefined)){
            Swal.fire(
                'Oops..',
                'Something went wrong! Check your fields and try again',
                'error'
            )
        }else{
            $.ajax({
                url: "/Staff/appointments",
                type: 'GET',
                data: {
                    _csrf_token: $('#csrf').val(),
                    update_appointment: {
                        status: status,
                        status_note: status_note,
                        id: id
                    }
                },
                success: function(result) {
                    if (result.status == true){
                        location.reload();
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
            });

        }
        
    });

});

