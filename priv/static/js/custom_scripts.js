// ----------------------------------------- Service Monitoring
$('#home').on('change', function() {
  //  alert( this.value ); // or $(this).val()
  if(this.value == "CBS") {
    $('#cbs_div').show();
    $('#napsa_div').hide();
    $('#zra_div').hide();
    $('#nhima_div').hide();
    $('#custom_div').hide();
  }


  if(this.value == "NHIMA") {
    $('#nhima_div').show();
    $('#napsa_div').hide();
    $('#zra_div').hide();
    $('#cbs_div').hide();
    $('#custom_div').hide();
  }

  if(this.value == "NAPSA") {
    $('#napsa_div').show();
    $('#nhima_div').hide();
    $('#zra_div').hide();
    $('#cbs_div').hide();
    $('#custom_div').hide();
  }

  if(this.value == "ZRA") {
  	$('#zra_div').show();
    $('#napsa_div').hide();
    $('#nhima_div').hide();
    $('#cbs_div').hide();
    $('#custom_div').hide();
  } 

  if(this.value == "CUSTOM") { 
    $('#custom_div').show();
    $('#zra_div').hide();
    $('#napsa_div').hide();
    $('#nhima_div').hide();
    $('#cbs_div').hide();
  }
});


// ----------------------------------------- Over Draft Account
$('#over_draft_sel').on('change', function() {
   // alert( this.value ); // or $(this).val()
  if(this.value == "YES") {
    $('.over_draft_account_number').show();
  }
});