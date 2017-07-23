<?php 
	require_once("db_con.php"); //connect
	
	//$a = $_GET["incident_id"];
	
	//$sql = "SELECT * FROM homeshield"; //execute
	if (isset($_GET["id"])){
		$sql = "SELECT * FROM accounts WHERE id = " . $_GET["id"];
	} else{
		$sql = "SELECT * FROM accounts";
	}
	
	
	$result = mysqli_query($conn, $sql); //fetch
	$info=array();
	while($data = mysqli_fetch_assoc($result)){
		array_push($info, $data);
		//$info = array('incident_id' => $data[0], 'owner_name' => $data[1]);
	}
	echo json_encode($info);
	
	
	
?>
