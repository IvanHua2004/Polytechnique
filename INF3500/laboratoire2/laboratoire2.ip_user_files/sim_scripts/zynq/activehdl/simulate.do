transcript off
onbreak {quit -force}
onerror {quit -force}
transcript on

asim +access +r +m+zynq  -L xil_defaultlib -L xilinx_vip -L xpm -L axi_lite_ipif_v3_0_4 -L interrupt_control_v3_1_5 -L axi_gpio_v2_0_37 -L proc_sys_reset_v5_0_17 -L xilinx_vip -L unisims_ver -L unimacro_ver -L secureip -O5 xil_defaultlib.zynq xil_defaultlib.glbl

do {zynq.udo}

run 1000ns

endsim

quit -force
