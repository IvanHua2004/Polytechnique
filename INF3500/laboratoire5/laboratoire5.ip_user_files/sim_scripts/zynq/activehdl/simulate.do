transcript off
onbreak {quit -force}
onerror {quit -force}
transcript on

asim +access +r +m+zynq  -L xil_defaultlib -L xilinx_vip -L xpm -L proc_sys_reset_v5_0_17 -L axi_datamover_v5_1_37 -L axi_sg_v4_1_21 -L axi_dma_v7_1_36 -L xilinx_vip -L unisims_ver -L unimacro_ver -L secureip -O5 xil_defaultlib.zynq xil_defaultlib.glbl

do {zynq.udo}

run 1000ns

endsim

quit -force
