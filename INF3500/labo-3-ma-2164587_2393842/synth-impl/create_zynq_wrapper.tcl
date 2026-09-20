## Specify that VHDL standard is VHDL2008
set_property -quiet FILE_TYPE {VHDL 2008} [get_files -filter {FILE_TYPE == VHDL}]
## Fix broken Windows imports
add_files -norecurse $env(XILINX_VIVADO)/data/ip/xpm/xpm_VCOMP.vhd
## Create Zynq block design
source [file dirname [info script]]/zynq.tcl
## Create VHDL wrapper
set_property -quiet target_language VHDL [current_project]
add_files -norecurse [make_wrapper -files [get_files ${design_name}.bd] -inst_template]
