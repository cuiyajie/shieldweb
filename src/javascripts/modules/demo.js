import $ from 'jquery';

import utils from '../components/utils';
import Loader from '../components/loader';
import AuthPage from '../components/auth';
import LivenessSDK from '../components/liveness/liveness';
import ComparePage from '../components/compare';
import ResultPage from '../components/result';
import MessageBox from '../components/messagebox';


/**
 * init tab
   Tab.init('origin');

   optimization
   cResult();

    draw doughnut
    Result(72);
 */
export default function() {
  $(function() {
    // const loader = new Loader({
    //   loaded: () => {
    //     if (LivenessSDK.isAvailable && utils.supportUploadImage() === 0) {
    //       authPage.show();
    //     } else {
    //       MessageBox.error('部分功能不可用，您可换用其他浏览器或手机', function() {
    //         authPage.show();
    //       })
    //     }
    //   }
    // });
    
    // const authPage = new AuthPage({
    //   authenticated: () => {
    //     comparePage.show();
    //   }
    // });

    const comparePage = new ComparePage({
      startCompare: () => {
        utils.showPage('comparing');
      },

      compareSuccess: data => {
        utils.showPage('result');
        resultPage.percent = data.confidence;
        resultPage.show();
      },

      compareFail: msg => {
        MessageBox.error(msg);
        utils.showPage('comparision');
      }
    });

    const resultPage = new ResultPage({
      complete: () => {
        comparePage.reset();
        utils.showPage('comparision');
      }
    });

    // loader.start();
    comparePage.show()
  })
}