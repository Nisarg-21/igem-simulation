import Image from "next/image";

/*
 * The three columns are top-aligned, not centre-aligned: the heading sits
 * highest so its long first line ("MEET YOUR") clears above Vera's head, then
 * "GUIDE" tucks in beside her. The name/bio block drops lower still, landing
 * around 40% down the portrait.
 */
export default function MeetYourGuide() {
  return (
    <div className="mx-auto flex w-full max-w-[556px] flex-col items-center gap-2 sm:w-fit sm:max-w-none sm:flex-row sm:items-start sm:gap-0">
      <h3 className="font-inika text-[28px] font-bold leading-[1.32] sm:w-[209px] sm:shrink-0 sm:text-center lg:text-[35.69px]">
        MEET YOUR GUIDE
      </h3>

      <Image
        src="/assets/vera-main.png"
        alt="Vera, the lab guide, in a white coat and round glasses"
        width={368}
        height={368}
        className="size-[184px] shrink-0 object-contain sm:-ml-[86px] sm:mt-[34px] lg:mt-[42px]"
        priority
      />

      <div className="text-center sm:-ml-[33px] sm:mt-[96px] sm:w-[222px] sm:text-left lg:mt-[116px]">
        <p className="text-[18px] font-bold leading-[22px]">VERA</p>
        <p className="font-inika mt-1 text-[14.69px] leading-[19px]">
          Runs the lab, narrates the chaos, still gets excited every single
          time.
        </p>
      </div>
    </div>
  );
}
